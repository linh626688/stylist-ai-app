import { supabase } from './supabase'

const SAMPLE_ITEMS = [
  {
    name: 'Áo sơ mi trắng basic',
    type: 'top',
    color: 'trắng',
    style_tags: ['casual', 'formal'],
    season: ['spring', 'summer', 'fall'],
    image_url: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&fit=crop',
  },
  {
    name: 'Quần jeans xanh đậm',
    type: 'bottom',
    color: 'xanh đậm',
    style_tags: ['casual', 'street'],
    season: ['spring', 'fall', 'winter'],
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&fit=crop',
  },
  {
    name: 'Váy hoa nhí',
    type: 'dress',
    color: 'nhiều màu',
    style_tags: ['boho', 'casual'],
    season: ['spring', 'summer'],
    image_url: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&fit=crop',
  },
  {
    name: 'Áo khoác da nâu',
    type: 'outer',
    color: 'nâu',
    style_tags: ['street', 'casual'],
    season: ['fall', 'winter'],
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&fit=crop',
  },
  {
    name: 'Sneakers trắng',
    type: 'shoes',
    color: 'trắng',
    style_tags: ['casual', 'sporty'],
    season: ['spring', 'summer', 'fall'],
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&fit=crop',
  },
  {
    name: 'Túi tote da bò',
    type: 'bag',
    color: 'camel',
    style_tags: ['casual', 'formal'],
    season: ['spring', 'summer', 'fall', 'winter'],
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&fit=crop',
  },
  {
    name: 'Blazer đen công sở',
    type: 'outer',
    color: 'đen',
    style_tags: ['formal'],
    season: ['spring', 'fall', 'winter'],
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4157?w=400&fit=crop',
  },
  {
    name: 'Váy trắng dự tiệc',
    type: 'dress',
    color: 'trắng',
    style_tags: ['formal'],
    season: ['spring', 'summer'],
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&fit=crop',
  },
]

export async function seedSampleItems(userId: string) {
  console.log('[seed] checking existing items for user', userId)

  const { count } = await supabase
    .from('clothing_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) > 0) {
    console.log('[seed] user already has items, skipping')
    return
  }

  console.log('[seed] inserting', SAMPLE_ITEMS.length, 'sample items')
  const { error } = await supabase.from('clothing_items').insert(
    SAMPLE_ITEMS.map(item => ({ ...item, user_id: userId }))
  )

  if (error) console.error('[seed] error', error)
  else console.log('[seed] done')
}
