import { GoogleGenerativeAI } from '@google/generative-ai'

const tag = '[gemini]'
const MODEL = 'gemini-2.0-flash'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function scanClothingImage(imageBase64: string, mimeType = 'image/jpeg') {
  console.log(`${tag} scanClothingImage model=${MODEL} mimeType=${mimeType}`)
  const model = genAI.getGenerativeModel({ model: MODEL })

  const prompt = `Phân tích ảnh quần áo này và trả về JSON (KHÔNG có markdown, KHÔNG có code block):
{
  "name": "tên ngắn gọn bằng tiếng Việt",
  "type": "top|bottom|dress|outer|shoes|bag|accessory",
  "color": "màu sắc bằng tiếng Việt (ví dụ: trắng, đen, xanh navy, kem)",
  "style_tags": ["tối đa 2, chọn từ: formal, casual, boho, street, sporty"],
  "season": ["chọn từ: spring, summer, fall, winter — có thể nhiều"]
}`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: imageBase64 } },
  ])

  const text = result.response.text().trim()
  console.log(`${tag} scanClothingImage raw response: ${text}`)

  const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(jsonStr)
  console.log(`${tag} scanClothingImage parsed`, parsed)
  return parsed
}

export async function verifyClothingFromUrl(title: string, imageUrl: string): Promise<boolean> {
  console.log(`${tag} verifyClothingFromUrl model=${MODEL} title="${title}" imageUrl=${imageUrl}`)
  const model = genAI.getGenerativeModel({ model: MODEL })

  const prompt = `Tên sản phẩm: "${title}"
URL ảnh: ${imageUrl}

Hãy trả lời ĐÚNG 1 trong 2:
- "CÓ" nếu đây là quần áo / phụ kiện thời trang (áo, quần, váy, giày, túi, phụ kiện...)
- "KHÔNG" nếu không phải (điện thoại, thực phẩm, đồ gia dụng, v.v.)

Chỉ trả lời 1 từ: CÓ hoặc KHÔNG`

  const result = await model.generateContent(prompt)
  const answer = result.response.text().trim()
  console.log(`${tag} verifyClothingFromUrl response="${answer}"`)
  return answer.toUpperCase().includes('CÓ')
}
