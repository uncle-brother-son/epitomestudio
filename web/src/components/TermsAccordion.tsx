'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import { Icon } from './Icons'

interface TermsAccordionProps {
  title?: string
  intro?: any
  terms: Array<{
    title: string
    content?: any
  }>
}

export function TermsAccordion({ title, intro, terms }: TermsAccordionProps) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div className="flex flex-col gap-y-6">
      {title && (
        <h2 className="label">{title}</h2>
      )}

      {intro && (
        <div className="terms">
          <PortableText value={intro} />
        </div>
      )}

      {terms.length > 0 && (
        <ol className="terms">
          {terms.map((item, index) => (
            <li key={index}>
              <button 
                onClick={() => toggleAccordion(index)} 
                className="flex flex-row justify-between items-center w-full"
              >
                <span className="text-xl">{item.title}</span>
                <Icon 
                  name="icon-chevron" 
                  className={`icon-chevron w-3 h-3 fill-black dark:fill-natural transition-transform duration-lg ease-es ${openAccordion === index ? 'rotate-270' : 'rotate-90'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 14 14" 
                  aria-hidden="true"
                >
                  <title>Toggle</title>
                </Icon>
              </button>
              <div 
                className={`grid transition-all duration-lg ease-es ${openAccordion === index ? 'pt-4 pb-4' : 'pt-2 pb-0'}`} 
                style={{ 
                  gridTemplateRows: openAccordion === index ? '1fr' : '0fr', 
                  opacity: openAccordion === index ? 1 : 0 
                }}
              >
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
  )
}
