import { client } from '@/lib/sanityClient'
import { Page } from '@/sanity/types'

export async function getAllPages(): Promise<Page[]> {
  const query = `*[_type == "page"] | order(publishedAt desc) {
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

  return await client.fetch(query)
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const query = `*[_type == "page" && slug.current == $slug][0] {
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
    content,
    publishedAt
  }`

  return await client.fetch(query, { slug })
}
