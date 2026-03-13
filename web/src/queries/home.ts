import { client } from '@/lib/sanityClient'

export interface Card {
  _key: string
  title: string
  image?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  video?: {
    asset: {
      _ref: string
      _type: 'reference'
      url?: string
    }
  }
  linkType: 'home' | 'studio' | 'equipment' | 'production' | 'contact' | 'legal'
  legalPage?: {
    slug: {
      current: string
    }
  }
  darkMode?: boolean
}

export interface Home {
  _id: string
  title?: string
  cards?: Card[]
  metaDescription?: string
}

export async function getHome(): Promise<Home | null> {
  const query = `*[_type == "home" && _id == "home"][0] {
    _id,
    title,
    metaDescription,
    cards[] {
      _key,
      title,
      image {
        asset
      },
      video {
        asset-> {
          _ref,
          _type,
          url
        }
      },
      linkType,
      legalPage-> {
        slug
      },
      darkMode
    }
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 60 }
  })
}
