'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { HeaderScrollProvider } from '@/contexts/HeaderScrollContext'
import type { Global } from '@/queries/global'

interface Props {
  global: Global | null
}

export function ConditionalHeader({ global }: Props) {
  const pathname = usePathname()
  
  // Don't show header on homepage
  if (pathname === '/') {
    return null
  }

  return (
    <HeaderScrollProvider>
      <Header global={global} />
    </HeaderScrollProvider>
  )
}
