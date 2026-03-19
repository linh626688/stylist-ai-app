'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  name: string | null
  email: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setProfile({
        name: session.user.user_metadata?.full_name ?? null,
        email: session.user.email ?? null,
        avatar_url: session.user.user_metadata?.avatar_url ?? null,
      })
    })
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tôi</h1>

      {profile && (
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl">
              👤
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-base">
              {profile.name ?? 'Người dùng'}
            </p>
            {profile.email && (
              <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="w-full py-3 text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-950/20 rounded-xl"
      >
        Đăng xuất
      </button>
    </div>
  )
}
