'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function DarkModeHandler() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.includes('/equipment-hire')) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [pathname])

  return null
}
