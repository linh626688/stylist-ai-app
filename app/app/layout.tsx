import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 max-w-lg mx-auto">
      {children}
      <BottomNav />
    </div>
  )
}
