'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ClothingCard from '@/components/ClothingCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClothingItem {
  id: string
  name: string
  type: string | null
  color: string | null
  image_url: string | null
}

const FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'top', label: 'Áo' },
  { key: 'bottom', label: 'Quần' },
  { key: 'dress', label: 'Váy' },
  { key: 'outer', label: 'Khoác' },
  { key: 'shoes', label: 'Giày' },
  { key: 'bag', label: 'Túi' },
]

export default function ClosetPage() {
  const router = useRouter()
  const [items, setItems] = useState<ClothingItem[]>([])
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single()

      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('clothing_items')
        .select('id, name, type, color, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setItems(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = activeFilter ? items.filter(i => i.type === activeFilter) : items

  return (
    <div className="px-4 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight">Tủ đồ</h1>
        <span className="text-sm text-muted-foreground">{items.length} món</span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-4 px-4">
        {FILTERS.map(f => (
          <Badge
            key={f.key}
            variant={activeFilter === f.key ? 'default' : 'outline'}
            className={cn(
              'flex-shrink-0 cursor-pointer px-3 h-7 rounded-full text-xs font-medium',
              activeFilter !== f.key && 'hover:bg-muted'
            )}
            onClick={() => setActiveFilter(f.key)}
            render={<button />}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-5xl mb-4">{activeFilter ? '🔍' : '👗'}</span>
          <p className="font-medium mb-1">
            {activeFilter ? 'Không có món đồ nào' : 'Tủ đồ đang trống'}
          </p>
          {!activeFilter && (
            <>
              <p className="text-muted-foreground text-sm mb-6">Thêm quần áo đầu tiên của bạn</p>
              <Button
                className="rounded-full px-6"
                onClick={() => router.push('/app/closet/add')}
              >
                Thêm quần áo
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4">
          {filtered.map(item => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* FAB */}
      {items.length > 0 && (
        <Button
          className="fixed bottom-20 right-4 size-14 rounded-full shadow-lg z-40 text-xl"
          onClick={() => router.push('/app/closet/add')}
          aria-label="Thêm quần áo"
        >
          +
        </Button>
      )}
    </div>
  )
}
