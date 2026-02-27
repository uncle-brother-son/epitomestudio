'use client'

import { useState } from 'react'
import { Drawer } from './Drawer'
import { EquipmentHireForm } from './EquipmentHireForm'
import { useEquipmentCart } from '@/contexts/EquipmentCartContext'
import type { Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'

interface Props {
  label: string
  className?: string
  equipment?: Equipment | null
  global?: Global | null
}

export function EquipmentHireButton({ label, className, equipment, global }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const { getTotalItems } = useEquipmentCart()
  const hasItems = getTotalItems() > 0

  const handleClick = () => {
    // If no items, show prompt briefly (for touch screens)
    if (!hasItems) {
      setShowPrompt(true)
      setTimeout(() => setShowPrompt(false), 2000)
      return
    }

    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button 
        className={`${className} relative overflow-hidden group transition-colors duration-md ease-es ${!hasItems ? 'hover:bg-black/60 dark:hover:bg-natural/60' : ''}`}
        onClick={handleClick} 
      >
        <span 
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-md ease-es ${
            !hasItems ? 'group-hover:-translate-y-full' : ''
          } ${showPrompt ? '-translate-y-full' : 'translate-y-0'}`}
        >
          {label}
        </span>
        {!hasItems && (
          <span 
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-md ease-es ${
              showPrompt ? 'translate-y-0' : 'translate-y-full'
            } group-hover:translate-y-0`}
          >
            Select Items
          </span>
        )}
      </button>

      <Drawer isOpen={isOpen} onClose={handleClose}>
        <EquipmentHireForm onClose={handleClose} equipment={equipment} global={global} />
      </Drawer>
    </>
  )
}
