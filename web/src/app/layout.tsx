import type { Metadata } from 'next'
import './globals.css'
import { getGlobal } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'
import { EquipmentCartProvider } from '@/contexts/EquipmentCartContext'
import { CookieConsentProvider } from '@/contexts/CookieConsentContext'
import { DarkModeHandler } from '@/components/DarkModeHandler'
import { PageTransition } from '@/components/PageTransition'
import { ConditionalHeader } from '@/components/ConditionalHeader'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal()
  const baseUrl = 'https://epitomestudio.ubs-demo.workers.dev'
  
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
        <GoogleAnalytics />
        
        <script dangerouslySetInnerHTML={{__html: `
          if (window.location.pathname.includes('/equipment-hire')) {
            document.documentElement.classList.add('dark');
          }
        `}} />
        <link rel="preload" href="/fonts/GeneralSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeneralSans-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="bg-natural dark:bg-black text-black dark:text-natural text-md subpixel-antialiased flex flex-col min-h-dvh transition-colors duration-lg ease-es">
        <DarkModeHandler />
        <CookieConsentProvider>
          <EquipmentCartProvider>
            <ConditionalHeader global={global} />
            <PageTransition>
              {children}
            </PageTransition>
          </EquipmentCartProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}