import { getHome } from '@/queries/home'
import type { Metadata } from 'next'
import { HomeIntro } from '@/components/HomeIntro'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome()
  
  return {
    description: home?.metaDescription || 'EPITOMESTUDIO',
  }
}

export default async function HomePage() {
  const home = await getHome()
  const cards = home?.cards || []

  return <HomeIntro cards={cards} />
}
