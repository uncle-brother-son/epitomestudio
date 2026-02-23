import { client } from '@/lib/sanityClient'

export interface Equipment {
  _id: string
  title: string
  metaDescription?: string
}

export interface EquipmentItem {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  image?: {
    asset: any
    alt?: string
    hotspot?: any
    crop?: any
  }
  content?: any
  publishedAt?: string
}

export async function getEquipment(): Promise<Equipment | null> {
  const query = `*[_type == "equipment"][0] {
    _id,
    title,
    metaDescription
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}

export async function getAllEquipmentItems(): Promise<EquipmentItem[]> {
  const query = `*[_type == "equipmentItem"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    image {
      asset,
      alt,
      hotspot,
      crop
    },
    publishedAt
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
