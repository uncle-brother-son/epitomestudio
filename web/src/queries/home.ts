import { client } from '@/lib/sanityClient'

export interface Card {
  _key: string
  title: string
  mediaType?: 'image' | 'video'
  image?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  mobileImage?: {
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
  videoPoster?: {
    asset: any
  }
  mobileVideo?: {
    asset: {
      _ref: string
      _type: 'reference'
      url?: string
    }
  }
  mobileVideoPoster?: {
    asset: any
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
      mediaType,
      image {
        asset
      },
      mobileImage {
        asset
      },
      video {
        asset-> {
          _ref,
          _type,
          url
        }
      },
      videoPoster {
        asset
      },
      mobileVideo {
        asset-> {
          _ref,
          _type,
          url
        }
      },
      mobileVideoPoster {
        asset
      },
      linkType,
      legalPage-> {
        slug
      },
      darkMode
    }
  }`

  return client.fetch(query)
}
