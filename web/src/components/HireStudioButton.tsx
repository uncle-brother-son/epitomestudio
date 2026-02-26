'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from './Drawer'
import { HireStudioForm } from './HireStudioForm'

interface Props {
  label: string
  className?: string
}

export function HireStudioButton({ label, className }: Props) {
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
        {label}
      </button>

      {typeof document !== 'undefined' && createPortal(
        <Drawer isOpen={isOpen} onClose={handleClose}>
          <HireStudioForm onClose={handleClose} />
        </Drawer>,
        document.body
      )}
    </>
  )
}
