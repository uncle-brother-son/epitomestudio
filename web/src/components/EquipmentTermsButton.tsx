'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Drawer } from './Drawer'
import { EquipmentTerms } from './EquipmentTerms'
import type { Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'

interface Props {
  className?: string
  equipment: Equipment
  global: Global
}

export function EquipmentTermsButton({ className, equipment, global }: Props) {
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
        <span>{equipment.termsHeader || 'Equipment Hire Policy'}</span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <Drawer isOpen={isOpen} onClose={handleClose}>
          <EquipmentTerms onClose={handleClose} equipment={equipment} global={global} />
        </Drawer>,
        document.body
      )}
    </>
  )
}
