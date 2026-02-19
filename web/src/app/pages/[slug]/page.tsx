import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getPageBySlug } from '@/queries/pages'
import { urlFor } from '@/lib/sanityImage'

export const runtime = 'edge'

export default async function PageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <article className="container py-16 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/pages" 
            prefetch={false}
            className="text-blue-600 hover:underline"
          >
            ← Back to Pages
          </Link>
        </div>
        
        {page.image && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={urlFor(page.image).width(1200).height(600).url()}
              alt={page.image.alt || page.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <h1 className="text-5xl font-bold mb-8">{page.title}</h1>
        
        {page.description && (
          <p className="text-xl text-gray-600 mb-8">{page.description}</p>
        )}
        
        {page.content && (
          <div className="prose prose-lg max-w-none">
            <PortableText value={page.content} />
          </div>
        )}
      </article>
    </main>
  )
}
