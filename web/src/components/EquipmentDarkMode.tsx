'use client'

import { useEffect } from 'react'

export function EquipmentDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    
    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return null
}
