'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

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
      <h1 className="text-xl font-bold tracking-tight mb-6">Tôi</h1>

      {profile && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-2xl">
          <Avatar size="lg" className="size-14">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name ?? 'avatar'} />
            <AvatarFallback className="text-lg">
              {profile.name?.[0]?.toUpperCase() ?? '👤'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{profile.name ?? 'Người dùng'}</p>
            {profile.email && (
              <p className="text-muted-foreground text-sm truncate mt-0.5">{profile.email}</p>
            )}
          </div>
        </div>
      )}

      <Separator className="mb-4" />

      <Button
        variant="destructive"
        onClick={handleSignOut}
        className="w-full rounded-xl"
      >
        Đăng xuất
      </Button>
    </div>
  )
}
