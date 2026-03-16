import type { Metadata } from 'next'
import './globals.css'
import { getGlobal } from '@/queries/global'
import { getHome } from '@/queries/home'
import { urlFor } from '@/lib/sanityImage'
import { EquipmentCartProvider } from '@/contexts/EquipmentCartContext'
import { CookieConsentProvider } from '@/contexts/CookieConsentContext'
import { PageTransition } from '@/components/PageTransition'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { StructuredData } from '@/components/StructuredData'
import { NewsletterBanner } from '@/components/NewsletterBanner'

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal()
  const home = await getHome()
  const baseUrl = 'https://www.epitomestudio.co.uk'
  
  const ogImageUrl = global?.ogImage 
    ? urlFor(global.ogImage).width(1200).height(630).url()
    : undefined

  const siteName = global?.siteName || 'EPITOMESTUDIO'
  const siteDescription = home?.metaDescription || 'Professional studio, equipment hire and production services'

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDescription,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: siteName,
      description: siteDescription,
      type: 'website',
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
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
        <StructuredData global={global} />
        
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        
        <link rel="preload" href="/fonts/GeneralSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeneralSans-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="bg-natural dark:bg-black text-black dark:text-natural text-md subpixel-antialiased flex flex-col min-h-dvh transition-colors duration-lg ease-es">
        <CookieConsentProvider>
          <EquipmentCartProvider>
            <PageTransition>
              {children}
            </PageTransition>
            <NewsletterBanner settings={global?.newsletterBanner} />
          </EquipmentCartProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
}