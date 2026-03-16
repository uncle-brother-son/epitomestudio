import { client } from '@/lib/sanityClient'

export interface Global {
  _id: string
  siteName?: string
  companyName?: string
  headerNavigation?: Array<{
    label: string
    url: string
  }>
  openingTimes?: any
  location?: any
  addressUrl?: string
  email?: string
  phone?: string
  companyInfo?: any
  instagram?: string
  ogImage?: {
    asset: any
    alt?: string
  }
  newsletterBanner?: {
    enabled?: boolean
    pageCountTrigger?: number
    heading?: string
    ctaText?: string
    emailPlaceholder?: string
    privacyText?: string
    successMessage?: string
  }
}

export async function getGlobal(): Promise<Global | null> {
  const query = `*[_type == "global" && _id == "global"][0] {
    _id,
    siteName,
    companyName,
    headerNavigation[]-> {
      _type,
      title
    },
    openingTimes,
    location,
    addressUrl,
    email,
    phone,
    companyInfo,
    instagram,
    ogImage {
      asset,
      alt
    },
    newsletterBanner {
      enabled,
      pageCountTrigger,
      heading,
      ctaText,
      emailPlaceholder,
      privacyText,
      successMessage
    }
  }`

  const result = await client.fetch(query)
  
  // Transform references to navigation items
  if (result?.headerNavigation && Array.isArray(result.headerNavigation)) {
    result.headerNavigation = result.headerNavigation
      .filter((page: any) => page && page.title) // Filter out null references
      .map((page: any) => {
        let url = '/'
        switch (page._type) {
          case 'home':
            url = '/'
            break
          case 'studio':
            url = '/studio-hire'
            break
          case 'equipment':
            url = '/equipment-hire'
            break
          default:
            url = `/${page._type}`
        }
        return {
          label: page.title,
          url,
        }
      })
  }
  
  return result
}
