'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Global } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'
import { Icon } from '@/components/Icons'


export function Header({ global }: { global: Global | null }) {
  const [translateY, setTranslateY] = useState(0)
  const headerRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const maxScroll = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDiff = currentScrollY - lastScrollY.current
      
      if (!headerRef.current) return
      
      // Get header height on first scroll
      if (maxScroll.current === 0) {
        maxScroll.current = headerRef.current.offsetHeight
      }
      
      // Calculate new translate value
      let newTranslateY = translateY - scrollDiff
      
      // Clamp between -maxScroll and 0
      newTranslateY = Math.max(-maxScroll.current, Math.min(0, newTranslateY))
      
      setTranslateY(newTranslateY)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [translateY])

  const navigation = global?.headerNavigation || [
    { label: 'Studio', url: '/studio-hire' },
    { label: 'Equipment', url: '/equipment-hire' },
    { label: 'Production', url: '/production' },
    { label: 'Contact', url: '/contact' },
  ]

  const mainNav = navigation.slice(0, -1)
  const lastNav = navigation[navigation.length - 1]

  return (
    <header 
      ref={headerRef}
      className="grid_ px-4 py-4 bg-natural dark:bg-black fixed top-0 left-0 right-0 z-20 transition-colors duration-md ease-es"
      style={{ transform: `translateY(${translateY}px)` }}
    >
      <div className="col-start-1 col-span-9 flex items-start justify-start">
        <Link href="/">
          <Icon name="icon-logo" className="icon-logo fill-black dark:fill-natural h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266 24"><title>Epitomestudio</title></Icon>
        </Link>
      </div>
      <nav className="col-start-10 col-span-3 lg:col-span-8 hidden lg:flex items-start justify-end gap-6">
        {mainNav.map((item, index) => (
          <Link key={index} href={item.url} className="link" >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {lastNav && (
        <div className="col-start-10 col-span-3 lg:col-start-18 lg:col-span-7 hidden lg:flex items-start justify-end">
          <Link href={lastNav.url} className="link">
            <span>{lastNav.label}</span>
          </Link>
        </div>
      )}
      <button className="lg:hidden col-start-10 col-span-3 flex items-start justify-end">
        <Icon name="icon-burger" className="icon-burger fill-black h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Menu</title></Icon>
      </button>
    </header>
  )
}
