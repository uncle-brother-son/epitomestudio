import { client } from '@/lib/sanityClient'

export interface Equipment {
  _id: string
  title: string
  slug?: { current: string }
  metaDescription?: string
  equipmentList?: {
    asset: {
      url: string
    }
  }
  equipmentListButtonLabel?: string
  termsHeader?: string
  termsTitle?: string
  termsIntro?: any
  termsAndConditions?: Array<{
    title: string
    content: any
  }>
}

export interface EquipmentItem {
  _id: string
  brand: string
  name: string
  price: number
  description?: any
  categories?: Array<{
    _id: string
    name: string
    slug: { current: string }
    parent?: {
      _id: string
      name: string
      slug: { current: string }
    }
  }>
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
    slug,
    metaDescription,
    equipmentList {
      asset-> {
        url
      }
    },
    equipmentListButtonLabel,
    termsHeader,
    termsTitle,
    termsIntro,
    termsAndConditions[] {
      title,
      content
    }
  }`

  return client.fetch(query)
}

export async function getAllEquipmentItems(): Promise<EquipmentItem[]> {
  const query = `*[_type == "equipmentItem"] | order(brand asc, name asc) {
    _id,
    brand,
    name,
    price,
    description,
    categories[]-> {
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

  return await client.fetch(query)
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

  return await client.fetch(query)
}
