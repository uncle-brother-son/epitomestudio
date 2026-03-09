import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Global } from '@/queries/global'
import { getAllLegal } from '@/queries/legal'

export async function Footer({ global }: { global: Global | null }) {
  const currentYear = new Date().getFullYear()
  const legalPages = await getAllLegal()

  return (
    <footer className="grid_ px-4 py-4 gap-y-12 lg:gap-y-20">

      {global?.openingTimes && (
        <div className="col-start-1 col-span-12 lg:col-start-1 lg:col-span-6">
          <h4 className='mb-1'>Opening Times</h4>
          <PortableText value={global.openingTimes} />
        </div>
      )}
      
      {global?.location && (
        <div className="col-start-1 col-span-12 lg:col-start-7 lg:col-span-6">
          <h4 className='mb-1'>Location</h4>
          {global.addressUrl ? (
            <a href={global.addressUrl} target="_blank" rel="noopener noreferrer">
              <PortableText value={global.location} />
            </a>
          ) : (
            <PortableText value={global.location} />
          )}
        </div>
      )}

      {global?.email && (
        <div className="col-start-1 col-span-12 lg:col-start-17 lg:col-span-4">
          <h4 className='mb-1'>General Enquiries</h4>
          <a target='_blank' href={`mailto:${global.email}`}>
            {global.email}
          </a>
        </div>
      )}

      {global?.instagram && (
        <div className="col-start-1 col-span-12 lg:col-start-21 lg:col-span-4">
          <h4 className='mb-1'>Instagram</h4>
          <a href={global.instagram.startsWith('http') ? global.instagram : `https://instagram.com/${global.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
            {global.instagram}
          </a>
        </div>
      )}

      <div className="col-start-1 col-span-12 lg:col-start-1 lg:col-span-16 link">
        &#169; {currentYear} {global?.companyName}
      </div>

      <nav className="col-start-1 col-span-12 lg:col-start-17 lg:col-span-8 flex flex-row gap-6 items-start justify-start">
        {legalPages.map((legal) => (
          <Link key={legal._id} href={`/legal/${legal.slug.current}`} className="link">
            <span>{legal.header}</span>
          </Link>
        ))}
      </nav>

    </footer>
  )
}
