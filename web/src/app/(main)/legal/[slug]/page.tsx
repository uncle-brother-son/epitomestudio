import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getLegalBySlug } from '@/queries/legal'
import type { Metadata } from 'next'

export const revalidate = 60 // Fallback time-based revalidation

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const legal = await getLegalBySlug(slug)
  const baseUrl = 'https://www.epitomestudio.co.uk'
  
  if (!legal) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: legal.header,
    description: legal.metaDescription || legal.header,
    alternates: {
      canonical: `${baseUrl}/legal/${slug}`,
    },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const legal = await getLegalBySlug(slug)

  if (!legal) {
    notFound()
  }

  return (
    <main id="main-content" className="grid_ my-xl grow">

      <div className="col-start-1 col-span-12 lg:col-start-7 lg:col-span-12 flex flex-col gap-y-16 lg:gap-y-20">
        <h1>{legal.header}</h1>
        {legal.content && (
          <div className="text-lg">
            <PortableText value={legal.content} />
          </div>
        )}
      </div>

    </main>
  )
}
