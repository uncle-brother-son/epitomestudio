'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from './Drawer'
import { StudioHireForm } from './StudioHireForm'

interface Props {
  label: string
  className?: string
}

export function StudioHireButton({ label, className }: Props) {
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
          <StudioHireForm onClose={handleClose} />
        </Drawer>,
        document.body
      )}
    </>
  )
}
