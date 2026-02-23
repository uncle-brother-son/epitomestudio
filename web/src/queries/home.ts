import { client } from '@/lib/sanityClient'

export interface Home {
  _id: string
  title: string
  description?: string
  content?: any
}

export async function getHome(): Promise<Home | null> {
  const query = `*[_type == "home" && _id == "home"][0] {
    _id,
    title,
    description,
    content
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
