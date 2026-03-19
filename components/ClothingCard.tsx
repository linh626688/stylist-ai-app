import Image from 'next/image'

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

export default function ClothingCard({ item }: { item: ClothingItem }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative aspect-[3/4]">
      {item.image_url ? (
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 33vw"
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
        <p className="text-white text-xs font-semibold truncate leading-tight">{item.name}</p>
        {item.type && (
          <p className="text-white/60 text-[10px] mt-0.5">{TYPE_LABELS[item.type] ?? item.type}</p>
        )}
      </div>
    </div>
  )
}
