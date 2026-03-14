'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { Drawer } from './Drawer'
import type { Studio } from '@/queries/studio'
import type { Global } from '@/queries/global'

// Lazy load the form component - only loads when user clicks "Hire Studio"
const StudioHireForm = dynamic(
  () => import('./StudioHireForm').then(mod => ({ default: mod.StudioHireForm })),
  { ssr: false }
)

interface Props {
  label: string
  className?: string
  studio?: Studio | null
  global?: Global | null
}

export function StudioHireButton({ label, className, studio, global }: Props) {
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
          <StudioHireForm onClose={handleClose} studio={studio} global={global} />
        </Drawer>,
        document.body
      )}
    </>
  )
}
