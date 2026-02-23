import { client } from '@/lib/sanityClient'

export interface Contact {
  _id: string
  title: string
  intro?: any
  mapLinkLabel?: string
  metaDescription?: string
}

export async function getContact(): Promise<Contact | null> {
  const query = `*[_type == "contact" && _id == "contact"][0] {
    _id,
    title,
    intro,
    mapLinkLabel,
    metaDescription
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
