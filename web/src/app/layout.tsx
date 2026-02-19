import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EPITOMESTUDIO',
  description: 'A modern web application built with Next.js and Sanity CMS',
  metadataBase: new URL('https://epitomestudio.pages.dev'),
  openGraph: {
    title: 'EPITOMESTUDIO',
    description: 'A modern web application built with Next.js and Sanity CMS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPITOMESTUDIO',
    description: 'A modern web application built with Next.js and Sanity CMS',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
