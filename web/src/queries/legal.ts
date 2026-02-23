import { client } from '@/lib/sanityClient'

export interface Legal {
  _id: string
  header: string
  slug: { current: string }
  content?: any
  metaDescription?: string
}

export async function getAllLegal(): Promise<Legal[]> {
  const query = `*[_type == "legal"] | order(_createdAt asc) {
    _id,
    header,
    slug,
    content,
    metaDescription
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}

export async function getLegalBySlug(slug: string): Promise<Legal | null> {
  const query = `*[_type == "legal" && slug.current == $slug][0] {
    _id,
    header,
    slug,
    content,
    metaDescription
  }`

  return await client.fetch(query, { slug }, {
    next: { revalidate: 60 }
  })
}
