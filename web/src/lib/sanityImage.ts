import { client } from './sanityClient'

interface ImageUrlBuilder {
  width(w: number): ImageUrlBuilder
  height(h: number): ImageUrlBuilder
  url(): string
}

// Edge-compatible image URL builder for Cloudflare
export function urlFor(source: any): ImageUrlBuilder {
  const projectId = client.config().projectId
  const dataset = client.config().dataset
  
  let width: number | undefined
  let height: number | undefined
  
  const builder: ImageUrlBuilder = {
    width(w: number): ImageUrlBuilder {
      width = w
      return builder
    },
    height(h: number): ImageUrlBuilder {
      height = h
      return builder
    },
    url(): string {
      if (!source?.asset) return ''
      
      // Extract asset reference
      const ref = typeof source.asset === 'string' 
        ? source.asset 
        : source.asset._ref || source.asset._id
      
      if (!ref) return ''
      
      // Parse the asset reference (format: image-{assetId}-{width}x{height}-{format})
      const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
      if (!match) return ''
      
      const [, assetId, dimensions, format] = match
      
      const params = new URLSearchParams()
      if (width) params.set('w', width.toString())
      if (height) params.set('h', height.toString())
      params.set('fit', 'max')
      params.set('auto', 'format')
      
      const queryString = params.toString()
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${format}${queryString ? '?' + queryString : ''}`
    }
  }
  
  return builder
}
