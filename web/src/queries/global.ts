import { client } from '@/lib/sanityClient'

export interface Global {
  _id: string
  siteName?: string
  headerNavigation?: Array<{
    label: string
    url: string
  }>
  openingTimes?: any
  location?: any
  addressUrl?: string
  email?: string
  phone?: string
  instagram?: string
  ogImage?: {
    asset: any
    alt?: string
  }
}

export async function getGlobal(): Promise<Global | null> {
  const query = `*[_type == "global" && _id == "global"][0] {
    _id,
    siteName,
    headerNavigation[]-> {
      _type,
      title
    },
    openingTimes,
    location,
    addressUrl,
    email,
    phone,
    instagram,
    ogImage {
      asset,
      alt
    }
  }`

  const result = await client.fetch(query, {}, {
    next: { revalidate: 60 } // Cache for 60 seconds
  })
  
  // Transform references to navigation items
  if (result?.headerNavigation) {
    result.headerNavigation = result.headerNavigation.map((page: any) => ({
      label: page.title,
      url: page._type === 'home' ? '/' : `/${page._type}`,
    }))
  }
  
  return result
}
