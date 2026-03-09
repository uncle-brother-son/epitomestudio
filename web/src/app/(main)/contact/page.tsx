
import { PortableText } from '@portabletext/react'
import ContactForm from '@/components/ContactForm'
import { getContact } from '@/queries/contact'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'
import { Icon } from '@/components/Icons'
import { StickyContent } from '@/components/StickyContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    <main id="main-content" className="grid_ my-xl gap-y-lg grow">
              
        <div className='px-2 lg:px-0 col-start-1 col-span-12 lg:col-start-1 lg:col-span-6 2xl:col-start-2 2xl:col-span-5'>
          <StickyContent className="flex flex-col gap-6 lg:sticky" top={20}>
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
                <a href={global.addressUrl} target="_blank" rel="noopener noreferrer" className="link line self-start">
                  <span>{contact.mapLinkLabel}</span>
                  <Icon name="icon-arrowAngle" className="icon-arrowAngle fill-black dark:fill-natural h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>External Link</title></Icon>
                </a>
            )}
          </StickyContent>
        </div>

        <div className='px-2 lg:px-0 col-start-1 col-span-12 lg:col-start-13 lg:col-span-10'>
          <ContactForm />
        </div>

    </main>
  )
}
