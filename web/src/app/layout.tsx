import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getGlobal } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const global = await getGlobal()
    const baseUrl = 'https://epitomestudio.pages.dev'
    
    let ogImageUrl: string | undefined
    try {
      ogImageUrl = global?.ogImage 
        ? urlFor(global.ogImage).width(1200).height(630).url()
        : undefined
    } catch (e) {
      console.error('Error generating OG image URL:', e)
      ogImageUrl = undefined
    }

    return {
      title: global?.siteName || 'EPITOMESTUDIO',
      description: 'A modern web application built with Next.js and Sanity CMS',
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: global?.siteName || 'EPITOMESTUDIO',
        description: 'A modern web application built with Next.js and Sanity CMS',
        type: 'website',
        ...(ogImageUrl && { images: [ogImageUrl] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: global?.siteName || 'EPITOMESTUDIO',
        description: 'A modern web application built with Next.js and Sanity CMS',
        ...(ogImageUrl && { images: [ogImageUrl] }),
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'EPITOMESTUDIO',
      description: 'A modern web application built with Next.js and Sanity CMS',
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let global = null
  try {
    global = await getGlobal()
  } catch (error) {
    console.error('Error loading global data:', error)
  }

  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/GeneralSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/GeneralSans-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-natural dark:bg-black text-black dark:text-natural text-md subpixel-antialiased flex flex-col min-h-screen">
        <Header global={global} />
        {children}
        <Footer global={global} />
      </body>
    </html>
  )
}