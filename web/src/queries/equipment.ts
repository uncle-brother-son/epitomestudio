import { client } from '@/lib/sanityClient'

export interface Equipment {
  _id: string
  title: string
  metaDescription?: string
}

export interface EquipmentItem {
  _id: string
  brand: string
  name: string
  price: number
  description?: any
  category?: {
    _id: string
    name: string
    slug: { current: string }
    parent?: {
      _id: string
      name: string
      slug: { current: string }
    }
  }
  image?: {
    asset: any
    hotspot?: any
    crop?: any
  }
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
  const query = `*[_type == "equipmentItem"] | order(name asc) {
    _id,
    brand,
    name,
    price,
    description,
    category-> {
      _id,
      name,
      slug,
      parent-> {
        _id,
        name,
        slug
      }
    },
    image {
      asset,
      hotspot,
      crop
    }
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}

export interface Category {
  _id: string
  name: string
  slug: { current: string }
  parent?: {
    _id: string
    name: string
    slug: { current: string }
  }
  order: number
}

export async function getAllCategories(): Promise<Category[]> {
  const query = `*[_type == "category"] | order(order asc) {
    _id,
    name,
    slug,
    parent-> {
      _id,
      name,
      slug
    },
    order
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
