import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getLegalBySlug } from '@/queries/legal'
import { getEquipment } from '@/queries/equipment'
import { getStudio } from '@/queries/studio'
import { getGlobal } from '@/queries/global'
import type { Metadata } from 'next'
import { TermsAccordion } from '@/components/TermsAccordion'

export const revalidate = false // On-demand revalidation only

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const legal = await getLegalBySlug(slug)
  const baseUrl = 'https://www.epitomestudio.co.uk'
  
  if (!legal) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: legal.header,
    description: legal.metaDescription || legal.header,
    alternates: {
      canonical: `${baseUrl}/legal/${slug}`,
    },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const legal = await getLegalBySlug(slug)

  if (!legal) {
    notFound()
  }

  // Fetch terms data if this is the terms-and-conditions page
  let studio = null
  let equipment = null
  let global = null
  
  if (slug === 'terms-and-conditions') {
    studio = await getStudio()
    equipment = await getEquipment()
    global = await getGlobal()
  }

  return (
    <main id="main-content" className="grid_ my-xl grow">

      <div className="col-start-1 col-span-12 lg:col-start-7 lg:col-span-12 flex flex-col gap-y-16 lg:gap-y-20">
        <h1>{legal.header}</h1>
        {slug === 'terms-and-conditions' ? (
          <div className="flex flex-col gap-y-16 lg:gap-y-20">
            
            {/* Studio Terms */}
            {studio?.termsTitle && studio?.termsAndConditions && (
              <TermsAccordion 
                title={studio.termsHeader}
                intro={studio.termsIntro}
                terms={studio.termsAndConditions}
              />
            )}

            {/* Equipment Terms */}
            {equipment?.termsTitle && equipment?.termsAndConditions && (
              <TermsAccordion 
                title={equipment.termsHeader}
                intro={equipment.termsIntro}
                terms={equipment.termsAndConditions}
              />
            )}

            {/* Contact Section */}
            {global && (
              <div className="flex flex-col gap-y-6">
                <h2 className="label">Contact</h2>

                {global.companyName && global.location && (
                  <div className="flex flex-col gap-0">
                    <div>{global.companyName}</div>
                    <div className="rich">
                      <PortableText 
                        value={global.location}
                        components={{
                          block: {
                            normal: ({children}) => <>{children}</>
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {global.email && (
                  <a href={`mailto:${global.email}`}>
                    <span>{global.email}</span>
                  </a>
                )}

                {global.companyInfo && (
                  <div className="rich">
                    <PortableText value={global.companyInfo} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          legal.content && (
            <div className="terms-page">
              <PortableText value={legal.content} />
            </div>
          )
        )}
      </div>

    </main>
  )
}
