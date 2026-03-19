'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'

const CLOTHING_TYPES = [
  { value: 'top', label: 'Áo' },
  { value: 'bottom', label: 'Quần' },
  { value: 'dress', label: 'Váy' },
  { value: 'outer', label: 'Khoác' },
  { value: 'shoes', label: 'Giày' },
  { value: 'bag', label: 'Túi' },
  { value: 'accessory', label: 'Phụ kiện' },
]
const STYLE_OPTIONS = [
  { value: 'formal', label: 'Công sở' },
  { value: 'casual', label: 'Casual' },
  { value: 'boho', label: 'Boho' },
  { value: 'street', label: 'Street' },
  { value: 'sporty', label: 'Thể thao' },
]
const SEASON_OPTIONS = [
  { value: 'spring', label: 'Xuân' },
  { value: 'summer', label: 'Hè' },
  { value: 'fall', label: 'Thu' },
  { value: 'winter', label: 'Đông' },
]

interface Form {
  name: string
  type: string
  color: string
  style_tags: string[]
  season: string[]
  source_url: string
}

export default function AddClothingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'image' | 'url'>('image')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState<Form>({
    name: '',
    type: '',
    color: '',
    style_tags: [],
    season: [],
    source_url: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      supabase.from('users').select('id').eq('auth_id', session.user.id).single()
        .then(({ data }) => setUserId(data?.id ?? null))
    })
  }, [router])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Compress
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    })
    setImageFile(compressed)
    setImagePreview(URL.createObjectURL(compressed))

    // Convert to base64 and auto-scan
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1]
      setScanning(true)
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: compressed.type }),
        })
        const data = await res.json()
        if (data.name) {
          setForm(f => ({
            ...f,
            name: data.name ?? f.name,
            type: data.type ?? f.type,
            color: data.color ?? f.color,
            style_tags: data.style_tags ?? f.style_tags,
            season: data.season ?? f.season,
          }))
        }
      } catch {
        // Scan failed — user fills manually
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(compressed)
  }

  async function handleUrlImport() {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError('')
    try {
      const res = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setUrlError(data.error || 'Lỗi không xác định'); return }
      setImagePreview(data.image_url)
      setForm(f => ({ ...f, name: data.suggested_name || f.name, source_url: data.source_url }))
    } finally {
      setUrlLoading(false)
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { showToast('Vui lòng nhập tên món đồ'); return }
    if (!userId) { showToast('Chưa đăng nhập'); return }

    setSaving(true)
    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${Date.now()}.${ext}`
        const { data: uploaded, error: uploadError } = await supabase.storage
          .from('clothing-images')
          .upload(path, imageFile, { contentType: imageFile.type })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('clothing-images')
          .getPublicUrl(uploaded.path)

        imageUrl = publicUrl
      } else if (imagePreview && tab === 'url') {
        imageUrl = imagePreview
      }

      const { error } = await supabase.from('clothing_items').insert({
        user_id: userId,
        name: form.name.trim(),
        type: form.type || null,
        color: form.color || null,
        style_tags: form.style_tags,
        season: form.season,
        image_url: imageUrl,
        source_url: form.source_url || null,
      })

      if (error) throw error

      showToast('Đã thêm vào tủ đồ!')
      setTimeout(() => router.push('/app/closet'), 1200)
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi lưu. Thử lại nhé.')
    } finally {
      setSaving(false)
    }
  }

  function toggleTag(field: 'style_tags' | 'season', value: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(x => x !== value)
        : [...f[field], value],
    }))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => router.back()} className="text-sm text-gray-500 dark:text-gray-400">
          ←
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">Thêm quần áo</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        {[
          { key: 'image', label: '📷 Chụp / Chọn ảnh' },
          { key: 'url', label: '🔗 Link TMĐT' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'image' | 'url')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 pb-36">
        {/* Tab: Image */}
        {tab === 'image' && (
          <div className="mb-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 text-gray-400"
              >
                <span className="text-5xl">📷</span>
                <span className="text-sm">Chụp ảnh hoặc chọn từ thư viện</span>
              </button>
            )}
            {scanning && (
              <p className="text-center text-purple-600 text-sm mt-3 animate-pulse">
                ✨ AI đang nhận diện quần áo...
              </p>
            )}
          </div>
        )}

        {/* Tab: URL */}
        {tab === 'url' && (
          <div className="mb-5">
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Paste link Shopee, Lazada, TikTok Shop..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={handleUrlImport}
                disabled={urlLoading || !urlInput.trim()}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {urlLoading ? '...' : 'Lấy'}
              </button>
            </div>
            {urlError && <p className="text-red-500 text-xs mb-3">{urlError}</p>}
            {imagePreview && tab === 'url' && (
              <div className="w-full aspect-square rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Tên món đồ *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Áo sơ mi trắng..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Loại
            </label>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, type: f.type === t.value ? '' : t.value }))}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.type === t.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Màu sắc
            </label>
            <input
              type="text"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              placeholder="Trắng, đen, xanh navy..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Phong cách
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => toggleTag('style_tags', s.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.style_tags.includes(s.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Mùa mặc
            </label>
            <div className="flex flex-wrap gap-2">
              {SEASON_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => toggleTag('season', s.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.season.includes(s.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className="w-full py-3.5 bg-purple-600 text-white rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Đang lưu...' : 'Thêm vào tủ đồ'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl text-sm text-center z-50 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
