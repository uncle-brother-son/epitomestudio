import { getHome } from '@/queries/home'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'
import { HomeIntro } from '@/components/HomeIntro'

export const revalidate = false // On-demand revalidation only

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome()
  const global = await getGlobal()
  const siteName = global?.siteName || 'EPITOMESTUDIO'
  const baseUrl = 'https://www.epitomestudio.co.uk'
  const pageTitle = home?.title ? `${siteName} | ${home.title}` : siteName
  const pageDescription = home?.metaDescription || 'EPITOMESTUDIO'
  
  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: baseUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
    },
  }
}

export default async function HomePage() {
  const home = await getHome()
  const cards = home?.cards || []

  return <HomeIntro cards={cards} title={home?.title} />
}
