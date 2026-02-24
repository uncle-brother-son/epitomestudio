import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import ContactForm from '@/components/ContactForm'
import { getContact } from '@/queries/contact'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'
import { Icon } from '@/components/Icons'
import { div } from 'framer-motion/m'

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact()
  
  return {
    title: contact?.title || 'Contact',
    description: contact?.metaDescription || 'Get in touch with us',
  }
}

export default async function ContactPage() {
  const contact = await getContact()
  const global = await getGlobal()

  return (
    <main className="grid_ px-4 my-xl gap-y-lg grow">
              
      <div className='col-start-1 col-span-12 lg:col-start-2 lg:col-span-5 flex flex-col gap-6'>
        {contact?.intro && (
          <div className="text-balance">
            <PortableText value={contact.intro} />
          </div>
        )}

        {global?.phone && (
          <a href={`tel:${global.phone.replace(/\s/g, '')}`} className="">
            {global.phone}
          </a>
        )}

        {global?.email && (
          <a target='_blank' href={`mailto:${global.email}`} className="">
            {global.email}
          </a>
        )}

        {global?.location && (
          global.addressUrl ? (
            <a href={global.addressUrl} target="_blank" rel="noopener noreferrer" className="">
              <PortableText value={global.location} />
            </a>
          ) : (
            <div className="text-gray-600">
              <PortableText value={global.location} />
            </div>
          )
        )}

        {contact?.mapLinkLabel && global?.addressUrl && (
          <div>
            <a href={global.addressUrl} target="_blank" rel="noopener noreferrer" className="link">
              {contact.mapLinkLabel}
              <Icon name="icon-arrowAngle" className="icon-arrowAngle fill-black h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>External Link</title></Icon>
            </a>
          </div>
        )}
      </div>

      <div className='col-start-1 col-span-12 lg:col-start-15 lg:col-span-8'>
        <ContactForm />
      </div>

    </main>
  )
}
