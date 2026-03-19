'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shirt, Sparkles, ScanFace, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/app/closet', icon: Shirt, label: 'Tủ đồ' },
  { href: '/app/suggest', icon: Sparkles, label: 'Gợi ý' },
  { href: '/app/try-on', icon: ScanFace, label: 'Thử đồ' },
  { href: '/app/profile', icon: User, label: 'Tôi' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('size-5', isActive && 'fill-primary/20')} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
