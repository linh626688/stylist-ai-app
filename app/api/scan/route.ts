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
    // ~4MB base64 limit (prevents large payloads abusing Gemini quota)
    if (imageBase64.length > 5_500_000) {
      return Response.json({ error: 'Ảnh quá lớn' }, { status: 413 })
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (mimeType && !allowedMimeTypes.includes(mimeType)) {
      return Response.json({ error: 'Định dạng ảnh không hỗ trợ' }, { status: 400 })
    }

    const result = await scanClothingImage(imageBase64, mimeType || 'image/jpeg')
    console.log(`${tag} result`, result)
    return Response.json(result)
  } catch (error) {
    console.error(`${tag} error`, error)
    return Response.json({ error: 'Không thể phân tích ảnh. Hãy thử nhập tay.' }, { status: 500 })
  }
}
