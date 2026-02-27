'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from './Drawer'
import { StudioTerms } from './StudioTerms'
import type { Studio } from '@/queries/studio'
import type { Global } from '@/queries/global'

interface Props {
  className?: string
  studio: Studio
  global: Global
}

export function StudioTermsButton({ className, studio, global }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button className={className} onClick={handleOpen}>
        <span>{studio.termsHeader || 'Studio Hire Policy'}</span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <Drawer isOpen={isOpen} onClose={handleClose}>
          <StudioTerms onClose={handleClose} studio={studio} global={global} />
        </Drawer>,
        document.body
      )}
    </>
  )
}
