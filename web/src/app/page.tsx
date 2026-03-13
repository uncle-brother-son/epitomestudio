import { getHome } from '@/queries/home'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'
import { HomeIntro } from '@/components/HomeIntro'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome()
  const global = await getGlobal()
  const siteName = global?.siteName || 'EPITOMESTUDIO'
  const baseUrl = 'https://www.epitomestudio.co.uk'
  
  return {
    title: home?.title ? `${siteName} | ${home.title}` : siteName,
    description: home?.metaDescription || 'EPITOMESTUDIO',
    alternates: {
      canonical: baseUrl,
    },
  }
}

export default async function HomePage() {
  const home = await getHome()
  const cards = home?.cards || []

  return <HomeIntro cards={cards} title={home?.title} />
}
