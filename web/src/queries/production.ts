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
    metaDescription
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
