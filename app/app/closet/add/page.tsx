'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Camera, Link2, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const [activeTab, setActiveTab] = useState('image')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState<Form>({
    name: '', type: '', color: '', style_tags: [], season: [], source_url: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data } = await supabase.from('users').select('id').eq('auth_id', session.user.id).single()
      if (data?.id) {
        setUserId(data.id)
      } else {
        // User row missing (e.g. skipped auth callback) — create it now
        const { data: created } = await supabase
          .from('users')
          .upsert(
            { auth_id: session.user.id, name: session.user.user_metadata?.full_name ?? null, avatar_url: session.user.user_metadata?.avatar_url ?? null },
            { onConflict: 'auth_id' }
          )
          .select('id')
          .single()
        setUserId(created?.id ?? null)
      }
    })
  }, [router])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true })
    setImageFile(compressed)
    setImagePreview(URL.createObjectURL(compressed))

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1]
      setScanning(true)
      const scanToast = toast.loading('AI đang nhận diện quần áo...')
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
          toast.success('Nhận diện thành công!', { id: scanToast })
        } else {
          toast.dismiss(scanToast)
        }
      } catch {
        toast.error('Không thể nhận diện. Điền tay nhé.', { id: scanToast })
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(compressed)
  }

  async function handleUrlImport() {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    try {
      const res = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Lỗi không xác định'); return }
      setImagePreview(data.image_url)
      setForm(f => ({ ...f, name: data.suggested_name || f.name, source_url: data.source_url }))
      toast.success('Đã lấy thông tin sản phẩm!')
    } finally {
      setUrlLoading(false)
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên món đồ'); return }
    if (!userId) { toast.error('Chưa đăng nhập'); return }

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
        const { data: { publicUrl } } = supabase.storage.from('clothing-images').getPublicUrl(uploaded.path)
        imageUrl = publicUrl
      } else if (imagePreview && activeTab === 'url') {
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

      toast.success('Đã thêm vào tủ đồ!')
      setTimeout(() => router.push('/app/closet'), 1000)
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi lưu. Thử lại nhé.')
    } finally {
      setSaving(false)
    }
  }

  function toggleTag(field: 'style_tags' | 'season', value: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(x => x !== value) : [...f[field], value],
    }))
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 bg-background border-b">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-base font-semibold">Thêm quần áo</h1>
      </div>

      <div className="px-4 py-4 pb-28 space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-10">
            <TabsTrigger value="image" className="flex-1 gap-2">
              <Camera className="size-4" /> Chụp / Chọn ảnh
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1 gap-2">
              <Link2 className="size-4" /> Link TMĐT
            </TabsTrigger>
          </TabsList>

          {/* Tab: Image */}
          <TabsContent value="image" className="mt-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <X className="size-3.5" />
                </Button>
                {scanning && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-background rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      AI đang nhận diện...
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <Camera className="size-10" strokeWidth={1.5} />
                <span className="text-sm font-medium">Chụp ảnh hoặc chọn từ thư viện</span>
              </button>
            )}
          </TabsContent>

          {/* Tab: URL */}
          <TabsContent value="url" className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Paste link Shopee, Lazada, TikTok Shop..."
                className="h-10 rounded-xl flex-1"
              />
              <Button
                onClick={handleUrlImport}
                disabled={urlLoading || !urlInput.trim()}
                className="h-10 px-4 rounded-xl shrink-0"
              >
                {urlLoading ? <Loader2 className="size-4 animate-spin" /> : 'Lấy'}
              </Button>
            </div>
            {imagePreview && activeTab === 'url' && (
              <div className="w-full aspect-square rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Form */}
        <Card>
          <CardContent className="space-y-5 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tên món đồ *
              </Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Áo sơ mi trắng..."
                className="h-10 rounded-xl"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loại</Label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_TYPES.map(t => (
                  <Badge
                    key={t.value}
                    variant={form.type === t.value ? 'default' : 'outline'}
                    className={cn('cursor-pointer px-3 h-7 rounded-full text-xs transition-all', form.type !== t.value && 'hover:bg-muted')}
                    onClick={() => setForm(f => ({ ...f, type: f.type === t.value ? '' : t.value }))}
                    render={<button />}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Màu sắc</Label>
              <Input
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                placeholder="Trắng, đen, xanh navy..."
                className="h-10 rounded-xl"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phong cách</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map(s => (
                  <Badge
                    key={s.value}
                    variant={form.style_tags.includes(s.value) ? 'default' : 'outline'}
                    className={cn('cursor-pointer px-3 h-7 rounded-full text-xs', !form.style_tags.includes(s.value) && 'hover:bg-muted')}
                    onClick={() => toggleTag('style_tags', s.value)}
                    render={<button />}
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mùa mặc</Label>
              <div className="flex flex-wrap gap-2">
                {SEASON_OPTIONS.map(s => (
                  <Badge
                    key={s.value}
                    variant={form.season.includes(s.value) ? 'default' : 'outline'}
                    className={cn('cursor-pointer px-3 h-7 rounded-full text-xs', !form.season.includes(s.value) && 'hover:bg-muted')}
                    onClick={() => toggleTag('season', s.value)}
                    render={<button />}
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="w-full h-12 rounded-full font-semibold mt-2"
            >
              {saving ? <><Loader2 className="size-4 animate-spin mr-2" />Đang lưu...</> : 'Thêm vào tủ đồ'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save — fixed bottom (visible when keyboard is dismissed) */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-background/80 backdrop-blur border-t">
        <Button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className="w-full h-12 rounded-full font-semibold"
        >
          {saving ? <><Loader2 className="size-4 animate-spin mr-2" />Đang lưu...</> : 'Thêm vào tủ đồ'}
        </Button>
      </div>
    </div>
  )
}
