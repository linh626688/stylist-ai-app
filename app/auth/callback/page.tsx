'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { seedSampleItems } from '@/lib/seed'
import type { Session } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let handled = false

    async function onSession(session: Session) {
      if (handled) return
      handled = true
      console.log('[callback] session acquired uid=', session.user.id)

      const { error } = await supabase.from('users').upsert(
        {
          auth_id: session.user.id,
          name: session.user.user_metadata?.full_name ?? null,
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: 'auth_id' }
      )
      if (error) console.error('[callback] upsert user error', error)

      // Fetch the internal user id for seeding
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single()
      if (userData?.id) {
        await seedSampleItems(userData.id)
      }

      router.replace('/app/closet')
    }

    // Subscribe TRƯỚC — Supabase tự exchange code (detectSessionInUrl=true)
    // và fire SIGNED_IN khi xong. Ta chỉ cần lắng nghe.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[callback] onAuthStateChange event=', event)
      if (event === 'SIGNED_IN' && session) {
        onSession(session)
      }
    })

    // Fallback: check nếu session đã được exchange trước khi subscribe
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[callback] getSession =', session ? 'ok' : 'null')
      if (session) onSession(session)
    })

    // Timeout nếu không nhận được session sau 15s
    const timeout = setTimeout(() => {
      if (!handled) {
        console.error('[callback] timeout — no session')
        router.replace('/login?error=auth_timeout')
      }
    }, 15000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">✨</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Đang đăng nhập...</p>
      </div>
    </div>
  )
}
