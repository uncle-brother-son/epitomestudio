import { MetadataRoute } from 'next'
import { getAllPosts } from '@/queries/posts'
import { getAllPages } from '@/queries/pages'

export const runtime = 'edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://epitomestudio.pages.dev'

  const posts = await getAllPosts()
  const pages = await getAllPages()

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug.current}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}/pages/${page.slug.current}`,
    lastModified: new Date(page.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pages`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...postUrls,
    ...pageUrls,
  ]
}
