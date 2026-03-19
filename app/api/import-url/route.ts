import { verifyClothingFromUrl } from '@/lib/gemini'

export async function POST(request: Request) {
  const tag = '[import-url]'

  try {
    const { url } = await request.json()
    console.log(`${tag} url=${url}`)

    if (!url) {
      return Response.json({ error: 'Thiếu URL' }, { status: 400 })
    }

    // Block SSRF: only allow public HTTP/HTTPS URLs
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return Response.json({ error: 'URL không hợp lệ' }, { status: 400 })
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return Response.json({ error: 'URL không hợp lệ' }, { status: 400 })
    }
    const hostname = parsed.hostname
    const isPrivate =
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.') ||
      hostname === '0.0.0.0' ||
      hostname.includes('169.254') // AWS/GCP metadata
    if (isPrivate) {
      return Response.json({ error: 'URL không hợp lệ' }, { status: 400 })
    }

    // Fetch HTML — lấy og:image + og:title (public metadata)
    let html = ''
    let fetchStatus: number | null = null
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Stylist-AI/1.0)' },
        signal: AbortSignal.timeout(5000),
      })
      fetchStatus = res.status
      html = await res.text()
      console.log(`${tag} fetch ok status=${fetchStatus} html_len=${html.length}`)
    } catch (fetchErr) {
      console.error(`${tag} fetch failed`, fetchErr)
      return Response.json(
        { error: 'Không thể đọc trang này. Hãy thử upload ảnh thủ công.' },
        { status: 422 }
      )
    }

    // Parse Open Graph tags
    const ogImage =
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ??
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1]
    const ogTitle =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ??
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i)?.[1]

    console.log(`${tag} og:title="${ogTitle}" og:image=${ogImage ?? 'NOT_FOUND'}`)

    if (!ogImage) {
      console.warn(`${tag} no og:image found — html snippet: ${html.slice(0, 500)}`)
      return Response.json({ error: 'Không tìm thấy ảnh từ link này.' }, { status: 422 })
    }

    // Gemini xác nhận có phải quần áo không
    console.log(`${tag} calling gemini verify...`)
    const isClothing = await verifyClothingFromUrl(ogTitle ?? '', ogImage)
    console.log(`${tag} gemini isClothing=${isClothing}`)

    if (!isClothing) {
      return Response.json(
        { error: `"${ogTitle}" có vẻ không phải quần áo. Bạn có muốn thêm thủ công không?` },
        { status: 422 }
      )
    }

    const result = {
      image_url: ogImage,
      suggested_name: ogTitle?.replace(/[-_|].*$/, '').trim() ?? '',
      source_url: url,
    }
    console.log(`${tag} success`, result)
    return Response.json(result)
  } catch (error) {
    console.error(`${tag} unhandled error`, error)
    return Response.json({ error: 'Lỗi không xác định' }, { status: 500 })
  }
}
