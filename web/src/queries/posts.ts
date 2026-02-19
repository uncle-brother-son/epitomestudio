import { client } from '@/lib/sanityClient'
import { Post } from '@/sanity/types'

export async function getAllPosts(): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
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

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    author,
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
