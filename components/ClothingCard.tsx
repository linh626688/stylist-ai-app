import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClothingItem {
  id: string
  name: string
  type: string | null
  color: string | null
  image_url: string | null
}

const TYPE_LABELS: Record<string, string> = {
  top: 'Áo',
  bottom: 'Quần',
  dress: 'Váy',
  outer: 'Khoác',
  shoes: 'Giày',
  bag: 'Túi',
  accessory: 'Phụ kiện',
}

export default function ClothingCard({ item, className }: { item: ClothingItem; className?: string }) {
  return (
    <div className={cn('group relative rounded-2xl overflow-hidden bg-muted aspect-[3/4]', className)}>
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
          👕
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
        <p className="text-white text-xs font-semibold truncate leading-tight">{item.name}</p>
        {item.type && (
          <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1.5 bg-white/20 text-white border-0 hover:bg-white/30">
            {TYPE_LABELS[item.type] ?? item.type}
          </Badge>
        )}
      </div>
    </div>
  )
}
