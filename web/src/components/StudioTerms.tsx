'use client'

import { PortableText } from '@portabletext/react'
import { Icon } from './Icons'
import { TermsAccordion } from './TermsAccordion'
import type { Studio } from '@/queries/studio'
import type { Global } from '@/queries/global'

interface Props {
  onClose: () => void
  studio: Studio
  global: Global
}

export function StudioTerms({ onClose, studio, global }: Props) {
  return (
    <div className="grow flex flex-col pt-20 px-2 lg:px-0 min-h-0">

      {/* Close Button */}
        <button onClick={onClose} className="close absolute top-4 right-4">
          <span>Close</span>
          <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
        </button>

      <div className="grid_ gap-y-md overflow-y-scroll pb-8">

        {/* Column 1 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-2 lg:col-span-3">
            {studio?.termsHeader && (
              <h2 className="label">{studio.termsHeader}</h2>
            )}
        </div>

        {/* Column 2 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-6 lg:col-span-11">
            <TermsAccordion 
              title={studio?.termsTitle}
              intro={studio?.termsIntro}
              terms={studio?.termsAndConditions || []}
            />
        </div>

        {/* Column 3 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-19 lg:col-span-5 flex flex-col gap-y-6">
            {/* Contact Header */}
            <h2 className="label">Contact</h2>

            {/* Company Name & Location */}
            {global?.companyName && global?.location && (
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

            {/* Email */}
            {global?.email && (
                <a href={`mailto:${global.email}`}><span>{global.email}</span></a>
            )}

            {/* Company Info */}
            {global?.companyInfo && (
                <div className="rich"><PortableText value={global.companyInfo} /></div>
            )}
        </div>
      </div>
    </div>
  )
}
