# Stylist AI — MVP 2–3 Ngày · Free Stack
> Tiếng Việt · Gemini 1.5 Flash · Zero cost khi validate

---

## ⚡ Nguyên tắc 2–3 ngày

- **Chỉ build những gì người dùng THỰC SỰ cần** để validate
- **Không tối ưu sớm** — chạy được trước, đẹp sau
- **Dùng toàn bộ free tier** — $0 để chạy MVP
- Mỗi ngày = 1 milestone rõ ràng, có thể demo được

---

## 🆓 Free Stack (Đã xác minh 3/2026)

| Service | Dùng cho | Free tier | Ghi chú |
|---|---|---|---|
| **Supabase** | DB + Auth + Storage | 500MB DB · 1GB Storage · 50MB file | Đủ cho MVP |
| **Vercel** | Hosting Next.js | Unlimited deploy | Free mãi cho cá nhân |
| **Gemini 1.5 Flash** | AI scan ảnh + gợi ý outfit | **15 RPM · 1,500 RPD** | ⚠️ Dùng 1.5, không dùng 2.5 Flash |
| **@imgly/background-removal** | Xóa nền ảnh quần áo | Miễn phí hoàn toàn | Chạy trong browser, không cần server |
| **OpenWeatherMap** | Thời tiết | 1,000 calls/ngày | Free tier mãi mãi |
| **Google OAuth** | Đăng nhập | Miễn phí | Cấu hình qua Supabase |
| **Unsplash API** | Ảnh mẫu cho UI | 50 req/giờ | Free, dùng cho demo |

### ⚠️ Tại sao dùng Gemini 1.5 Flash thay vì 2.5 Flash?
- Sau Dec 2025, Gemini 2.5 Flash bị cắt còn ~250 RPD free
- Gemini **1.5 Flash** vẫn giữ **1,500 RPD** và hỗ trợ vision (xem ảnh)
- Với MVP 2–3 ngày, 1.5 Flash là lựa chọn tốt nhất về cost/performance
- Model string: `gemini-1.5-flash`

---

## 📦 Tech Stack

```
Frontend:  Next.js 14 (App Router) + Tailwind CSS
Backend:   Next.js API Routes (monorepo, không cần server riêng)
Database:  Supabase PostgreSQL
Auth:      Supabase Auth (Google OAuth + Phone OTP)
Storage:   Supabase Storage (ảnh quần áo)
AI Scan:   Gemini 1.5 Flash API (multimodal vision)
Remove BG: @imgly/background-removal (in-browser, FREE)
Weather:   OpenWeatherMap API
Deploy:    Vercel
```

---

## 🗓️ Kế hoạch 3 Ngày

---

### NGÀY 1 — Nền tảng + Tủ đồ + Import Link
**Mục tiêu: Đăng nhập + thêm quần áo bằng ảnh hoặc link TMĐT**

```
✅ Setup dự án (~30 phút)
   - npx create-next-app@latest stylist-ai --typescript --tailwind --app
   - npm install @supabase/supabase-js @google/generative-ai
   - npm install @imgly/background-removal browser-image-compression
   - Tạo project Supabase, lấy URL + anon key

✅ Database (chạy SQL trong Supabase dashboard)
   - Tạo bảng: users, clothing_items, looks
   - Bật RLS policies

✅ Auth
   - Supabase Google OAuth (cấu hình trong dashboard)
   - Trang /login đơn giản
   - Middleware bảo vệ route /app/*

✅ Layout chính
   - Bottom nav 4 tab: Tủ đồ / Gợi ý / Thử đồ / Tôi
   - Dark/light mode toggle (localStorage)

✅ Tủ đồ (CRUD cơ bản)
   - /app/closet — grid 2 cột, filter chips
   - /app/closet/add — 3 tab: Chụp ảnh / Thư viện / Link TMĐT
   - Compress ảnh trước khi upload (browser-image-compression)
   - Hiển thị ảnh từ Supabase Storage

✅ AI Scan (Gemini 1.5 Flash)
   - Upload ảnh → gọi API → nhận type/color/style
   - Hiển thị kết quả dạng tag có thể chỉnh sửa
   - Fallback: user nhập tay nếu scan fail

✅ [MỚI] Import link TMĐT (Shopee / Lazada / TikTok Shop)
   - User paste URL → server fetch HTML
   - Parse og:image + og:title từ <head>
   - Gemini 1.5 Flash xác nhận "có phải quần áo không?"
   - Nếu có: pre-fill form, user confirm → lưu tủ đồ
   - Nếu không: hiện thông báo "Link này không phải quần áo"
   - Fallback an toàn: nếu fetch bị block → user tự upload ảnh

Demo cuối ngày 1: Đăng nhập Google → thêm quần áo bằng ảnh → import từ link Shopee
```

---

### NGÀY 2 — Gợi ý AI + Thử đồ
**Mục tiêu: AI gợi ý được outfit, thử đồ ảo hoạt động**

```
✅ Weather widget
   - Gọi OpenWeatherMap → hiển thị Hà Nội
   - Cache 30 phút trong localStorage

✅ Outfit Suggestion (Gemini 1.5 Flash)
   - Gửi danh sách items + thời tiết + dịp → nhờ Gemini gợi ý
   - Hiển thị 3 set đồ dạng card
   - Filter chips: Công sở / Casual / Party

✅ Virtual Try-On 2D
   - @imgly/background-removal: xóa nền ảnh quần áo (chạy trên browser)
   - Hiển thị avatar + overlay ảnh đã xóa nền
   - Slot 4 items: áo / quần / outer / giày
   - Nút Lưu look

✅ Outfit Detail page
   - Grid 2x2 ảnh thật
   - Danh sách items
   - CTA: Thử đồ này

Demo cuối ngày 2: AI gợi ý 3 outfit → mặc thử ảo → lưu look
```

---

### NGÀY 3 — Onboarding + Polish + Deploy
**Mục tiêu: App đủ đẹp để cho người dùng thật dùng thử**

```
✅ Onboarding
   - 3 slides welcome (ảnh Unsplash)
   - Style quiz: chọn phong cách (2x2 grid)
   - Chọn vóc dáng avatar
   - Lưu preferences vào Supabase

✅ Profile page
   - Thống kê: số items / outfits / looks
   - Dark mode toggle
   - Đăng xuất

✅ Empty states
   - Tủ đồ trống → "Thêm quần áo đầu tiên"
   - Chưa có gợi ý → "Thêm ít nhất 5 items"

✅ Loading states + Toast notifications (tiếng Việt)

✅ Deploy lên Vercel
   - vercel deploy
   - Cấu hình env vars
   - Test trên điện thoại thật

✅ Bug fixes và final polish

Demo cuối ngày 3: App chạy được trên điện thoại thật, share link cho người thử
```

---

## 🗄️ Database Schema (Tối giản cho MVP)

```sql
-- Chạy trong Supabase SQL Editor

-- Bảng users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  avatar_url  TEXT,
  body_type   TEXT DEFAULT 'straight',
  style_prefs TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Bảng clothing_items
CREATE TABLE clothing_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT,        -- 'top','bottom','dress','outer','shoes','bag'
  color       TEXT,
  style_tags  TEXT[],      -- ['formal','casual','boho']
  season      TEXT[],      -- ['spring','summer','fall','winter']
  image_url   TEXT,        -- Supabase Storage
  image_no_bg TEXT,        -- URL ảnh đã xóa nền
  source_url  TEXT,        -- Link TMĐT
  wear_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Bảng looks (saved try-on)
CREATE TABLE looks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT,
  item_ids     UUID[],
  screenshot   TEXT,        -- base64 hoặc Storage URL
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE looks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own" ON users FOR ALL USING (auth_id = auth.uid());
CREATE POLICY "own" ON clothing_items FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "own" ON looks FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
```

---

## 🤖 Gemini Integration

### AI Scan ảnh quần áo
```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function scanClothingImage(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Phân tích ảnh quần áo này và trả về JSON (KHÔNG có markdown):
{
  "name": "tên ngắn gọn bằng tiếng Việt",
  "type": "top|bottom|dress|outer|shoes|bag|accessory",
  "color": "màu sắc bằng tiếng Việt (ví dụ: trắng, đen xanh, kem)",
  "style_tags": ["formal|casual|boho|street|sporty (tối đa 2)"],
  "season": ["spring|summer|fall|winter (có thể nhiều)"]
}`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
  ]);

  return JSON.parse(result.response.text());
}

export async function suggestOutfits(items: any[], context: {
  temp: number;
  occasion: string;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Bạn là stylist AI cho phụ nữ Việt Nam.
Tủ đồ: ${JSON.stringify(items.map(i => ({ id: i.id, name: i.name, type: i.type, color: i.color, style: i.style_tags })))}
Thời tiết: ${context.temp}°C
Dịp: ${context.occasion}

Gợi ý 3 bộ đồ. Trả về JSON (KHÔNG có markdown):
[
  {
    "name": "tên bộ đồ tiếng Việt",
    "item_ids": ["uuid1", "uuid2", "uuid3"],
    "reason": "lý do ngắn gọn tiếng Việt",
    "vibe": "Office chic|Casual cool|Party ready|..."
  }
]`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

### Import Link TMĐT — Smart Meta Fetch
```typescript
// app/api/import-url/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const { url } = await req.json();

  // 1. Fetch HTML — lấy og:image + og:title (công khai, không vi phạm ToS)
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Stylist-AI/1.0)" },
      signal: AbortSignal.timeout(5000), // timeout 5s
    });
    html = await res.text();
  } catch {
    return Response.json({ error: "Không thể đọc trang này. Hãy thử upload ảnh thủ công." }, { status: 422 });
  }

  // 2. Parse Open Graph tags
  const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1]
                ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1];
  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1]
                ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i)?.[1];

  if (!ogImage) {
    return Response.json({ error: "Không tìm thấy ảnh từ link này." }, { status: 422 });
  }

  // 3. Gemini xác nhận có phải quần áo không
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const checkPrompt = `Đây là ảnh sản phẩm từ một trang thương mại điện tử.
Tên sản phẩm: "${ogTitle}"
URL ảnh: ${ogImage}

Hãy trả lời ĐÚNG 1 trong 2:
- "CÓ" nếu đây là quần áo / phụ kiện thời trang (áo, quần, váy, giày, túi, phụ kiện...)
- "KHÔNG" nếu không phải (điện thoại, thực phẩm, đồ gia dụng, v.v.)

Chỉ trả lời 1 từ: CÓ hoặc KHÔNG`;

  const result = await model.generateContent(checkPrompt);
  const answer = result.response.text().trim().toUpperCase();

  if (!answer.includes("CÓ")) {
    return Response.json({ error: `"${ogTitle}" có vẻ không phải quần áo. Bạn có muốn thêm thủ công không?` }, { status: 422 });
  }

  // 4. Nếu là quần áo → trả về data để pre-fill form
  return Response.json({
    image_url: ogImage,
    suggested_name: ogTitle?.replace(/[-_|].*$/, "").trim(), // clean tên
    source_url: url,
  });
}
```

### Remove Background (in-browser, miễn phí)
```typescript
// hooks/useRemoveBg.ts
import { removeBackground } from "@imgly/background-removal";

export async function removeBgFromFile(file: File): Promise<string> {
  // Chạy hoàn toàn trong browser — không tốn API
  const blob = await removeBackground(file, {
    model: "small",  // 40MB, đủ cho MVP
    output: { format: "image/png" }
  });
  return URL.createObjectURL(blob);
}
```

---

## 📁 Folder Structure (Tối giản)

```
stylist-ai/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── onboarding/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← Bottom nav
│   │   ├── closet/
│   │   │   ├── page.tsx
│   │   │   └── add/page.tsx
│   │   ├── suggest/page.tsx
│   │   ├── try-on/page.tsx
│   │   └── profile/page.tsx
│   └── api/
│       ├── scan/route.ts       ← Gemini scan
│       └── suggest/route.ts    ← Gemini outfit
├── components/
│   ├── BottomNav.tsx
│   ├── ClothingCard.tsx
│   ├── OutfitCard.tsx
│   └── AvatarStage.tsx
├── lib/
│   ├── supabase.ts
│   └── gemini.ts
└── hooks/
    ├── useCloset.ts
    └── useRemoveBg.ts
```

---

## 🌍 Environment Variables

```env
# .env.local

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

GEMINI_API_KEY=AIza...          # Google AI Studio → miễn phí
OPENWEATHER_API_KEY=xxxx        # openweathermap.org → miễn phí
```

---

## 🚀 Setup nhanh (30 phút đầu)

```bash
# 1. Tạo dự án
npx create-next-app@latest stylist-ai --typescript --tailwind --app
cd stylist-ai

# 2. Cài packages
npm install @supabase/supabase-js @google/generative-ai @imgly/background-removal

# 3. Lấy API keys (tất cả miễn phí)
# - Supabase: supabase.com → New project
# - Gemini: aistudio.google.com → Get API key
# - OpenWeather: openweathermap.org → Free API key

# 4. Tạo .env.local với các keys trên

# 5. Chạy SQL schema trong Supabase dashboard

# 6. Dev server
npm run dev
```

---

## ⚡ Đánh giá khả năng hoàn thành

### Xác suất theo ngày
| Ngày | Mục tiêu | Khả năng |
|---|---|---|
| Ngày 1 | Setup + Auth + Closet + AI Scan + Import Link | **82%** — nhiều task nhưng đều rõ ràng |
| Ngày 2 | Weather + Outfit AI + Try-On cơ bản | **61%** — Try-On là điểm rủi ro nhất |
| Ngày 3 | Onboarding + Profile + Deploy + Buffer | **78%** — nếu ngày 2 không bị trễ |
| **Tổng MVP spec** | Tất cả tính năng đã spec | **~48%** — nếu build mọi thứ |
| **MVP đủ demo** | Core flow chạy được | **72%** — nếu cắt tính năng thứ cấp |

### Tính năng nên cắt (không ảnh hưởng core value)
- ❌ **Event calendar** — 5h+, user có thể tự nhớ
- ❌ **Phone OTP auth** — Google OAuth là đủ cho MVP
- ❌ **Save Look & Share** — nice-to-have, không phải MVP
- ❌ **Outfit match score** — AI gợi ý là đủ, score là cosmetic

### Fallback nếu bị trễ
- **Try-On bị trễ** → dùng emoji overlay (đã có trong prototype), vẫn demo được
- **Gemini rate limit** → thêm retry logic + nhập tay fallback
- **Import link bị block** → hiện message gợi ý upload ảnh thủ công
- **Remove BG chậm trên mobile** → show ảnh gốc với border, remove bg chạy nền

### Chìa khoá thành công
1. **Build theo thứ tự dọc** — mỗi tính năng chạy độc lập trước khi tiếp theo
2. **Luôn có fallback** — không có tính năng nào được block toàn bộ app
3. **Vibe code với Claude** — mô tả rõ context + file cần edit, không build từ đầu
4. **Test trên điện thoại thật** từ cuối ngày 1, không đợi đến ngày 3

---

```
Ngày 1:
"Claude, build cho tôi trang /app/closet/add với:
- Upload zone chạm để chọn ảnh
- Khi có ảnh, gọi /api/scan để AI nhận diện
- Hiển thị kết quả dạng tag có thể edit
- Nút Thêm vào tủ đồ lưu vào Supabase
- UI dùng Tailwind, mobile-first, tiếng Việt"

Ngày 2:
"Claude, build trang /app/suggest với:
- Fetch thời tiết từ OpenWeatherMap (Hà Nội)
- Gọi /api/suggest gửi items + temp + occasion
- Hiển thị 3 outfit cards dạng carousel
- Filter chips: Công sở / Casual / Party / Tiệc"

Ngày 3:
"Claude, build onboarding flow 3 bước:
- Slide 1: Welcome + ảnh Unsplash
- Slide 2: Style quiz 2x2 grid (chọn nhiều)
- Slide 3: Chọn avatar vóc dáng
- Lưu vào bảng users.style_prefs + body_type"
```

---

## ⚡ Các phím tắt validate nhanh

| Câu hỏi cần validate | Cách test nhanh nhất |
|---|---|
| AI scan có đủ chính xác không? | Scan 10 ảnh quần áo thật, đếm tỉ lệ đúng |
| Người dùng có thêm quần áo không? | Cho 3 người bạn thử, xem họ dừng ở đâu |
| Gợi ý outfit có useful không? | Hỏi: "Bạn có mặc thử set này không?" |
| Remove BG có đủ nhanh không? | Test trên điện thoại Android tầm trung |

---

*Cập nhật: 03/2026 · Gemini 1.5 Flash · Free Stack · 2–3 ngày build*
