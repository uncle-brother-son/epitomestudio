import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getHome } from '@/queries/home'

export const runtime = 'edge'

export default async function HomePage() {
  const home = await getHome()

  if (!home) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Welcome to EPITOMESTUDIO</h1>
          <p className="text-gray-600 mb-8">
            Configure your home page content in Sanity Studio.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-8">{home.title}</h1>
        
        {home.description && (
          <p className="text-xl text-gray-600 mb-12">{home.description}</p>
        )}

        {home.content && (
          <div className="prose prose-lg max-w-none mb-12">
            <PortableText value={home.content} />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Link 
            href="/studio" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Studio</h2>
            <p className="text-gray-600">Learn about our studio</p>
          </Link>

          <Link 
            href="/equipment" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Equipment</h2>
            <p className="text-gray-600">Browse our equipment</p>
          </Link>

          <Link 
            href="/production" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Production</h2>
            <p className="text-gray-600">Our production services</p>
          </Link>

          <Link 
            href="/contact" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Contact</h2>
            <p className="text-gray-600">Get in touch</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
