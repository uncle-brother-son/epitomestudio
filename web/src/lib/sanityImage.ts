import { client } from './sanityClient'

// Edge-compatible image URL builder for Cloudflare
export function urlFor(source: any) {
  const projectId = client.config().projectId
  const dataset = client.config().dataset
  
  if (!source?.asset) return { url: () => '' }
  
  // Extract asset reference
  const ref = typeof source.asset === 'string' 
    ? source.asset 
    : source.asset._ref || source.asset._id
  
  if (!ref) return { url: () => '' }
  
  // Parse the asset reference (format: image-{assetId}-{width}x{height}-{format})
  const [, assetId, dimensions, format] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) || []
  
  if (!assetId) return { url: () => '' }
  
  let width: number | undefined
  let height: number | undefined
  
  return {
    width(w: number) {
      width = w
      return this
    },
    height(h: number) {
      height = h
      return this
    },
    url() {
      const params = new URLSearchParams()
      if (width) params.set('w', width.toString())
      if (height) params.set('h', height.toString())
      params.set('fit', 'max')
      params.set('auto', 'format')
      
      const queryString = params.toString()
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${format}${queryString ? '?' + queryString : ''}`
    }
  }
}
