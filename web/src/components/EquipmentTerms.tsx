'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import { Icon } from './Icons'
import type { Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'

interface Props {
  onClose: () => void
  equipment: Equipment
  global: Global
}

export function EquipmentTerms({ onClose, equipment, global }: Props) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div className="grow flex flex-col p-4 pt-20">

      {/* Close Button */}
        <button onClick={onClose} className="close absolute top-4 right-4">
          <span>Close</span>
          <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
        </button>

      <div className="grow grid_ gap-y-md">

        {/* Column 1 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-2 lg:col-span-3">
            {equipment?.termsHeader && (
              <h2 className="label">{equipment.termsHeader}</h2>
            )}
        </div>

        {/* Column 2 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-6 lg:col-span-11 flex flex-col gap-y-6">
            {equipment?.termsTitle && (
              <h3 className="label">{equipment.termsTitle}</h3>
            )}

            {/* Intro */}
            {equipment?.termsIntro && (
              <div className="terms">
                <PortableText value={equipment.termsIntro} />
              </div>
            )}

            {/* Terms & Conditions Accordion */}
            {equipment?.termsAndConditions && equipment.termsAndConditions.length > 0 && (
              <ol className="terms">
                {equipment.termsAndConditions.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="flex flex-row justify-between items-center w-full"
                    >
                      <span className="text-xl">{item.title}</span>
                      <Icon name="icon-chevron" className={`icon-chevron w-3 h-3 fill-black dark:fill-natural transition-transform duration-lg ease-es ${ openAccordion === index ? 'rotate-270' : 'rotate-90' }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Toggle</title></Icon>
                    </button>
                    <div className={`grid transition-all duration-lg ease-es pt-2 ${openAccordion === index ? 'pb-4' : 'pb-0'}`} style={{ gridTemplateRows: openAccordion === index ? '1fr' : '0fr', opacity: openAccordion === index ? 1 : 0 }}>
                      <div className="overflow-hidden">
                        {item.content && (
                            <PortableText value={item.content} />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
        </div>

        {/* Column 3 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-19 lg:col-span-5 flex flex-col gap-y-6">
            {/* Contact Header */}
            <h3 className="label">Contact</h3>

            {/* Company Name & Location */}
            {global?.companyName && global?.location && (
              <div className="flex flex-col gap-0">
                <div>{global.companyName}</div>
                <div className="rich"><PortableText value={global.location} /></div>
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
