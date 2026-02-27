import { client } from '@/lib/sanityClient'

export interface Studio {
  _id: string
  title: string
  content?: any
  moreInfoButtonLabel?: string
  hireStudioButtonLabel?: string
  imageGallery?: Array<{
    asset: any
    alt?: string
    caption?: string
    hotspot?: any
    crop?: any
  }>
  metaDescription?: string
  infoPack?: {
    asset: {
      url: string
    }
  }
  features?: any
  clients?: any
  studioInformation?: Array<{
    title: string
    content?: any
  }>
  termsHeader?: string
  termsTitle?: string
  termsIntro?: any
  termsAndConditions?: Array<{
    title: string
    content?: any
  }>
}

export async function getStudio(): Promise<Studio | null> {
  const query = `*[_type == "studio" && _id == "studio"][0] {
    _id,
    title,
    content,
    moreInfoButtonLabel,
    hireStudioButtonLabel,
    imageGallery[] {
      asset,
      alt,
      caption,
      hotspot,
      crop
    },
    metaDescription,
    infoPack {
      asset-> {
        url
      }
    },
    features,
    clients,
    studioInformation[] {
      title,
      content
    },
    termsHeader,
    termsTitle,
    termsIntro,
    termsAndConditions[] {
      title,
      content
    }
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
