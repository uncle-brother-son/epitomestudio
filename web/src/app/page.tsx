import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to EPITOMESTUDIO</h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern web application built with Next.js, Sanity CMS, and Tailwind CSS
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/posts" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Posts</h2>
            <p className="text-gray-600">Browse all blog posts</p>
          </Link>
          
          <Link 
            href="/content" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Content</h2>
            <p className="text-gray-600">View all pages</p>
          </Link>
          
          <Link 
            href="/contact" 
            prefetch={false}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Contact</h2>
            <p className="text-gray-600">Get in touch with us</p>
          </Link>
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Start Sanity Studio: <code className="bg-gray-200 px-2 py-1 rounded">cd studio && npm run dev</code></li>
            <li>Create content in Studio at <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3333</code></li>
            <li>View your content here on the website</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
