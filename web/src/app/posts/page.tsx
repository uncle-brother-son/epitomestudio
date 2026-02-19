import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/queries/posts'
import { urlFor } from '@/lib/sanityImage'

export default async function PostsPage() {
  const posts = await getAllPosts()

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
        
        <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
        
        {posts.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-gray-600">
              No posts yet. Create your first post in the Sanity Studio!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/posts/${post.slug.current}`}
                prefetch={false}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={urlFor(post.image).width(600).height(400).url()}
                      alt={post.image.alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  {post.author && (
                    <p className="text-sm text-gray-500 mb-2">by {post.author}</p>
                  )}
                  {post.description && (
                    <p className="text-gray-600">{post.description}</p>
                  )}
                  <time className="text-sm text-gray-400 mt-2 block">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
