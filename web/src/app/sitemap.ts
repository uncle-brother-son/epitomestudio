import { MetadataRoute } from 'next'
import { getAllLegal } from '@/queries/legal'
import { client } from '@/lib/sanityClient'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.epitomestudio.co.uk'

  // Fetch all legal pages
  const legal = await getAllLegal()

  // Fetch all main pages from Sanity
  const pages = await client.fetch(`
    {
      "home": *[_type == "home" && _id == "home"][0]{ _updatedAt },
      "studio": *[_type == "studio" && _id == "studio"][0]{ _updatedAt, slug },
      "equipment": *[_type == "equipment" && _id == "equipment"][0]{ _updatedAt, slug },
      "production": *[_type == "production" && _id == "production"][0]{ _updatedAt, slug },
      "contact": *[_type == "contact" && _id == "contact"][0]{ _updatedAt, slug }
    }
  `)

  const legalUrls = legal.map((item) => ({
    url: `${baseUrl}/legal/${item.slug.current}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const sitemap: MetadataRoute.Sitemap = []

  // Add homepage
  if (pages.home) {
    sitemap.push({
      url: baseUrl,
      lastModified: new Date(pages.home._updatedAt),
      changeFrequency: 'weekly',
      priority: 1,
    })
  }

  // Add studio page
  if (pages.studio?.slug?.current) {
    sitemap.push({
      url: `${baseUrl}/${pages.studio.slug.current}`,
      lastModified: new Date(pages.studio._updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Add equipment page
  if (pages.equipment?.slug?.current) {
    sitemap.push({
      url: `${baseUrl}/${pages.equipment.slug.current}`,
      lastModified: new Date(pages.equipment._updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Add production page
  if (pages.production?.slug?.current) {
    sitemap.push({
      url: `${baseUrl}/${pages.production.slug.current}`,
      lastModified: new Date(pages.production._updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Add contact page
  if (pages.contact?.slug?.current) {
    sitemap.push({
      url: `${baseUrl}/${pages.contact.slug.current}`,
      lastModified: new Date(pages.contact._updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return [...sitemap, ...legalUrls]
}
