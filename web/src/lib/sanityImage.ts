import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './sanityClient'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder
    .image(source)
    .auto('format') // Automatically serve WebP/AVIF to supported browsers
    .fit('max') // Ensure images don't exceed specified dimensions
    .quality(85) // Good balance between quality and file size
}
