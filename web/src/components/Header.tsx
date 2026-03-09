'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Global } from '@/queries/global'
import { urlFor } from '@/lib/sanityImage'
import { Icon } from '@/components/Icons'
import { useHeaderScroll } from '@/contexts/HeaderScrollContext'
import { usePathname } from 'next/navigation'

export function Header({ global }: { global: Global | null }) {
  const { translateY, setTranslateY } = useHeaderScroll()
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const lastScrollY = useRef(0)
  const maxScroll = useRef(0)
  const currentTranslateY = useRef(0)
  const currentYear = new Date().getFullYear()
  const [isMobileMenu, setIsMobileMenu] = useState(false)
  const toggleMobileMenu = () => {setIsMobileMenu(!isMobileMenu)}
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDiff = currentScrollY - lastScrollY.current
      
      if (!headerRef.current) return
      
      // Get header height on first scroll
      if (maxScroll.current === 0) {
        maxScroll.current = headerRef.current.offsetHeight
      }
      
      // Calculate new translate value using ref instead of state
      let newTranslateY = currentTranslateY.current - scrollDiff
      
      // Clamp between -maxScroll and 0
      newTranslateY = Math.max(-maxScroll.current, Math.min(0, newTranslateY))
      
      currentTranslateY.current = newTranslateY
      setTranslateY(newTranslateY)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setTranslateY])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenu])

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenu || !headerRef.current) return

    const headerElement = headerRef.current
    const focusableElements = headerElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus close button when menu opens
    menuButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // If shift+tab on first element, focus last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
      // If tab on last element, focus first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenu(false)
        menuButtonRef.current?.focus()
      }
    }

    headerElement.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      headerElement.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenu])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && isMobileMenu) {
        setIsMobileMenu(false)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isMobileMenu])

  const navigation = global?.headerNavigation || [
    { label: 'Studio', url: '/studio-hire' },
    { label: 'Equipment', url: '/equipment-hire' },
    { label: 'Production', url: '/production' },
    { label: 'Contact', url: '/contact' },
  ]

  const mainNav = navigation.slice(0, -1)
  const lastNav = navigation[navigation.length - 1]

  return (
    <>
      <a href="#main-content" className="sr-only">Skip to main content</a>
      <header 
        ref={headerRef} 
        className={`px-4 py-4 z-100 transition-colors duration-md ease-es ${isMobileMenu ? 'fixed inset-0 bg-natural dark:bg-black flex flex-col' : 'grid_ bg-transparent dark:bg-transparent fixed top-0 left-0 right-0'}`}
        {...(!isMobileMenu && { style: { transform: `translateY(${translateY}px)` } })}
      >
        <div className="col-start-1 col-span-12 lg:col-start-1 lg:col-span-9 flex items-start justify-between">
          <Link href="/" aria-label="Epitomestudio home">
          <Icon name="icon-logo" className="icon-logo fill-black dark:fill-natural h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266 24"><title>Epitomestudio</title></Icon>
        </Link>
        <button ref={menuButtonRef} className='lg:hidden p-3 -mr-3 -mt-3' onClick={toggleMobileMenu} aria-label="Toggle navigation menu" aria-expanded={isMobileMenu} aria-controls="mobile-navigation">
          {isMobileMenu ? (
            <Icon name="icon-close" className="icon-close fill-black dark:fill-natural h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Close</title></Icon>
          ) : (
            <Icon name="icon-burger" className="icon-burger fill-black dark:fill-natural h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Menu</title></Icon>
          )}
        </button>
      </div>

      <nav aria-label="Main navigation" className="col-start-10 col-span-3 lg:col-span-8 hidden lg:flex items-start justify-end gap-6">
        {mainNav.map((item) => {
          const isActive = pathname === item.url && item.url !== '/'
          return (
            <Link key={item.url} href={item.url} className={`link ${isActive ? 'line' : 'line-header'}`} aria-current={isActive ? 'page' : undefined}>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      {lastNav && (
        <nav aria-label="Secondary navigation" className="col-start-10 col-span-3 lg:col-start-18 lg:col-span-7 hidden lg:flex items-start justify-end">
          <Link href={lastNav.url} className={`link ${pathname === lastNav.url && lastNav.url !== '/' ? 'line' : 'line-header'}`} aria-current={pathname === lastNav.url && lastNav.url !== '/' ? 'page' : undefined}>
            <span>{lastNav.label}</span>
          </Link>
        </nav>
      )}

      {isMobileMenu && (
        <>
          <nav aria-label="Mobile navigation" id="mobile-navigation" className="grow flex flex-col gap-4 items-start justify-center">
            {navigation.map((item) => {
              const isActive = pathname === item.url && item.url !== '/'
              return (
                <Link key={item.url} href={item.url} className={`link text-lg${isActive ? ' line' : ''}`} onClick={() => setIsMobileMenu(false)} aria-current={isActive ? 'page' : undefined}>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <small className="col-start-1 col-span-12 lg:col-start-1 lg:col-span-16 link">&#169; {currentYear} {global?.companyName}</small>
        </>
      )}
      
      </header>
    </>
  )
}

