'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from './Drawer'
import { StudioInfo } from './StudioInfo'
import type { Studio } from '@/queries/studio'
import type { Global } from '@/queries/global'

interface Props {
  label: string
  className?: string
  studio: Studio
  global: Global
}

export function StudioInfoButton({ label, className, studio, global }: Props) {
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
        <span>{label}</span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <Drawer isOpen={isOpen} onClose={handleClose}>
          <StudioInfo onClose={handleClose} studio={studio} global={global} />
        </Drawer>,
        document.body
      )}
    </>
  )
}
