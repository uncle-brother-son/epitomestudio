import type { Metadata } from 'next'
import './globals.css'
import { getGlobal } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'
import { EquipmentCartProvider } from '@/contexts/EquipmentCartContext'
import { DarkModeHandler } from '@/components/DarkModeHandler'
import { PageTransition } from '@/components/PageTransition'

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal()
  const baseUrl = 'https://epitomestudio.pages.dev'
  
  const ogImageUrl = global?.ogImage 
    ? urlFor(global.ogImage).width(1200).height(630).url()
    : undefined

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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const global = await getGlobal()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GYB0PFE8BQ"></script>
        <script dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GYB0PFE8BQ');
        `}} />
        
        <script dangerouslySetInnerHTML={{__html: `
          if (window.location.pathname.includes('/equipment-hire')) {
            document.documentElement.classList.add('dark');
          }
        `}} />
        <link rel="preload" href="/fonts/GeneralSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeneralSans-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="bg-natural dark:bg-black text-black dark:text-natural text-md subpixel-antialiased flex flex-col min-h-screen transition-colors duration-md ease-es">
        <DarkModeHandler />
        <EquipmentCartProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </EquipmentCartProvider>
      </body>
    </html>
  )
}