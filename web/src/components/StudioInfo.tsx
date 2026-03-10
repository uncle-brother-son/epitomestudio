'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import { Icon } from './Icons'
import { StudioTermsButton } from './StudioTermsButton'
import type { Studio } from '@/queries/studio'
import type { Global } from '@/queries/global'

interface Props {
  onClose: () => void
  studio: Studio
  global: Global
}

export function StudioInfo({ onClose, studio, global }: Props) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div className="grow flex flex-col pt-20 px-2 lg:px-0 min-h-0">

      {/* Close Button */}
        <button onClick={onClose} className="close absolute top-4 right-4">
          <span>Close</span>
          <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
        </button>

      <div className="grid_ gap-y-md overflow-y-scroll pb-8">

        {/* Column 1 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-2 lg:col-span-5 flex flex-col gap-y-md">
            {/* Location */}
            {global?.location && (
            <div className="flex flex-col gap-6">
                <h3 className="label">Location</h3>
                {global.location && (
                <div className="rich">
                    <PortableText value={global.location} />
                </div>
                )}
                {global?.addressUrl && (
                <a href={global.addressUrl} target="_blank" rel="noopener noreferrer" className="link line self-start">
                    <span>Get Directions</span>
                    <Icon name="icon-arrowAngle" className="icon-arrowAngle fill-black dark:fill-natural h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>External Link</title></Icon>
                </a>
                )}
            </div>
            )}

            {/* Extras */}
            <div className="flex flex-col gap-6">
            <h3 className="label">Extras</h3>
            <div className="flex flex-col gap-4">
                <StudioTermsButton 
                  className="link line self-start"
                  studio={studio}
                  global={global}
                />
                {studio?.infoPack?.asset?.url && (
                    <a href={studio.infoPack.asset.url} target="_blank" rel="noopener noreferrer" className="link line self-start">
                        <span>Full Info Pack</span>
                        <Icon name="icon-download" className="icon-download fill-black dark:fill-natural h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>External Link</title></Icon>
                    </a>
                )}
            </div>
            </div>
        </div>

        {/* Column 2 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-7 flex flex-col gap-y-md">
            {/* Features */}
            {studio?.features && (
            <div className="flex flex-col gap-6">
                <h3 className="label">Features</h3>
                <div className="rich">
                <PortableText value={studio.features} />
                </div>
            </div>
            )}

            {/* Clients */}
            {studio?.clients && (
            <div className="flex flex-col gap-6">
                <h3 className="label">Clients</h3>
                <div className="rich">
                <PortableText value={studio.clients} />
                </div>
            </div>
            )}
        </div>

        {/* Column 3 */}
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-16 lg:col-span-7 flex flex-col gap-y-md">
            {/* Studio Information */}
            {studio?.studioInformation && studio.studioInformation.length > 0 && (
            <div className="flex flex-col gap-6">
                <h3 className="label">Studio Information</h3>
                <div className="flex flex-col gap-2">
                {studio.studioInformation.map((item, index) => (
                    <div key={index} className="flex flex-col">
                    <button
                        onClick={() => toggleAccordion(index)}
                        className="flex flex-row justify-between items-center"
                    >
                        <span className="text-xl">{item.title}</span>
                        <Icon name="icon-chevron" className={`icon-chevron w-3 h-3 fill-black dark:fill-natural transition-transform duration-lg ease-es ${ openAccordion === index ? 'rotate-270' : 'rotate-90' }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Toggle</title></Icon>
                    </button>
                    <div className={`grid transition-all duration-lg ease-es ${openAccordion === index ? 'pb-4 pt-2' : 'py-0'}`} style={{ gridTemplateRows: openAccordion === index ? '1fr' : '0fr', opacity: openAccordion === index ? 1 : 0 }}>
                        <div className="overflow-hidden">
                        {item.content && (
                            <div className="pl-2 rich">
                            <PortableText value={item.content} />
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  )
}
