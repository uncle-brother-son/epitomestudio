import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getPostBySlug } from '@/queries/posts'
import { urlFor } from '@/lib/sanityImage'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <article className="container py-16 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/posts" 
            prefetch={false}
            className="text-blue-600 hover:underline"
          >
            ← Back to Posts
          </Link>
        </div>
        
        {post.image && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={urlFor(post.image).width(1200).height(600).url()}
              alt={post.image.alt || post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex gap-4 text-gray-600 mb-8">
          {post.author && <span>by {post.author}</span>}
          <time>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        
        {post.description && (
          <p className="text-xl text-gray-600 mb-8">{post.description}</p>
        )}
        
        {post.content && (
          <div className="prose prose-lg max-w-none">
            <PortableText value={post.content} />
          </div>
        )}
      </article>
    </main>
  )
}
