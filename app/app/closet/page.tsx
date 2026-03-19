'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ClothingCard from '@/components/ClothingCard'

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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tủ đồ</h1>
        <span className="text-sm text-gray-400">{items.length} món</span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-4 px-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400 text-sm">Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-5xl mb-4">{activeFilter ? '🔍' : '👗'}</span>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            {activeFilter ? 'Không có món đồ nào' : 'Tủ đồ đang trống'}
          </p>
          {!activeFilter && (
            <>
              <p className="text-gray-400 text-sm mb-6">Thêm quần áo đầu tiên của bạn</p>
              <Link
                href="/app/closet/add"
                className="px-6 py-2.5 bg-purple-600 text-white rounded-full text-sm font-semibold"
              >
                Thêm quần áo
              </Link>
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
        <Link
          href="/app/closet/add"
          className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-purple-700 transition-colors z-40"
        >
          +
        </Link>
      )}
    </div>
  )
}
