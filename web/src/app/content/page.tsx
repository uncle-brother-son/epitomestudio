import Link from 'next/link'
import Image from 'next/image'
import { getAllPages } from '@/queries/pages'
import { urlFor } from '@/lib/sanityImage'

export default async function PagesIndexPage() {
  const pages = await getAllPages()

  return (
    <main className="min-h-screen">
      <div className="container py-16">
        <div className="mb-8">
          <Link 
            href="/" 
            prefetch={false}
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Pages</h1>
        
        {pages.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-gray-600">
              No pages yet. Create your first page in the Sanity Studio!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link
                key={page._id}
                href={`/content/${page.slug.current}`}
                prefetch={false}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {page.image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={urlFor(page.image).width(600).height(400).url()}
                      alt={page.image.alt || page.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{page.title}</h2>
                  {page.description && (
                    <p className="text-gray-600">{page.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
