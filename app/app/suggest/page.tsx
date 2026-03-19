'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SuggestPage() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
    })
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center">
      <span className="text-6xl mb-5">✨</span>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gợi ý outfit</h2>
      <p className="text-gray-400 text-sm mb-1">Tính năng sẽ có ở Ngày 2</p>
      <p className="text-gray-300 dark:text-gray-600 text-xs">
        Thêm ít nhất 5 món đồ vào tủ để nhận gợi ý AI
      </p>
    </div>
  )
}
