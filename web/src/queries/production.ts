import { client } from '@/lib/sanityClient'

export interface Production {
  _id: string
  title: string
  slug?: { current: string }
  content?: any
  link?: {
    label?: string
    url?: string
  }
  video?: {
    asset: any
  }
  videoPoster?: {
    asset: any
  }
  metaDescription?: string
}

export async function getProduction(): Promise<Production | null> {
  const query = `*[_type == "production" && _id == "production"][0] {
    _id,
    title,
    slug,
    content,
    link,
    video {
      asset
    },
    videoPoster {
      asset
    },
    metaDescription
  }`

  return client.fetch(query)
}
