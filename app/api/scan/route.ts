import { scanClothingImage } from '@/lib/gemini'

export async function POST(request: Request) {
  const tag = '[scan]'

  try {
    const { imageBase64, mimeType } = await request.json()
    console.log(`${tag} mimeType=${mimeType} base64_len=${imageBase64?.length ?? 0}`)

    if (!imageBase64) {
      console.warn(`${tag} missing imageBase64`)
      return Response.json({ error: 'Thiếu dữ liệu ảnh' }, { status: 400 })
    }

    const result = await scanClothingImage(imageBase64, mimeType || 'image/jpeg')
    console.log(`${tag} result`, result)
    return Response.json(result)
  } catch (error) {
    console.error(`${tag} error`, error)
    return Response.json({ error: 'Không thể phân tích ảnh. Hãy thử nhập tay.' }, { status: 500 })
  }
}
