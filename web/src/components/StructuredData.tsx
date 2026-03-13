import { Global } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'

interface StructuredDataProps {
  global: Global | null
}

export function StructuredData({ global }: StructuredDataProps) {
  if (!global) return null

  const baseUrl = 'https://www.epitomestudio.co.uk'
  
  const logoUrl = global.ogImage 
    ? urlFor(global.ogImage).width(600).height(600).url()
    : undefined

  // Extract address from portableText if available
  const getPlainTextFromPortableText = (portableText: any): string => {
    if (!portableText) return ''
    return portableText
      .map((block: any) => {
        if (block._type === 'block' && block.children) {
          return block.children.map((child: any) => child.text).join('')
        }
        return ''
      })
      .join('\n')
  }

  const addressText = global.location ? getPlainTextFromPortableText(global.location) : ''

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: global.siteName || 'EPITOMESTUDIO',
    url: baseUrl,
    ...(logoUrl && { logo: logoUrl }),
    ...(global.email && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: global.email,
        ...(global.phone && { telephone: global.phone }),
        contactType: 'customer service',
      },
    }),
    ...(global.instagram && {
      sameAs: [
        global.instagram.startsWith('http') 
          ? global.instagram 
          : `https://instagram.com/${global.instagram.replace('@', '')}`
      ],
    }),
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: global.siteName || 'EPITOMESTUDIO',
    ...(global.companyName && { legalName: global.companyName }),
    url: baseUrl,
    ...(logoUrl && { image: logoUrl }),
    ...(global.phone && { telephone: global.phone }),
    ...(global.email && { email: global.email }),
    ...(addressText && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: addressText.split('\n')[0] || addressText,
      },
    }),
    ...(global.addressUrl && { hasMap: global.addressUrl }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  )
}
