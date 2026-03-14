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
  const [isClosing, setIsClosing] = useState(false)
  const [isContentFading, setIsContentFading] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsMobileMenu(false)
      setIsClosing(false)
      setIsContentFading(false)
    }, 480) // duration-md for simultaneous fade
  }

  const toggleMobileMenu = () => {
    if (isMobileMenu) {
      closeMenu()
    } else {
      setIsMobileMenu(true)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      // Don't update header position when any overlay is open (body is locked)
      if (document.body.style.position === 'fixed') return
      
      // Prevent negative scroll values from iOS elastic scroll
      const currentScrollY = Math.max(0, window.scrollY)
      const scrollDiff = currentScrollY - lastScrollY.current
      
      if (!headerRef.current) return
      
      // Get header height on first scroll
      if (maxScroll.current === 0) {
        maxScroll.current = headerRef.current.offsetHeight
      }
      
      // Reset header when at top of page (handles elastic scroll reset)
      if (currentScrollY === 0) {
        currentTranslateY.current = 0
        setTranslateY(0)
        lastScrollY.current = 0
        return
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
      // Store current scroll position
      const scrollY = window.scrollY
      
      // Lock scrolling with position fixed (more reliable on mobile)
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Restore scroll position
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
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
        closeMenu()
        setTimeout(() => menuButtonRef.current?.focus(), 480)
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
        closeMenu()
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
        className={`px-4 py-4 z-20 mobile-menu-bg ${isMobileMenu ? `fixed inset-0 flex flex-col ${!isClosing ? 'bg-natural dark:bg-black' : ''}` : 'grid_ fixed top-0 left-0 right-0'} ${isClosing ? 'closing' : ''} ${isContentFading ? 'content-fading' : ''}`}
        {...(!isMobileMenu && { style: { transform: `translateY(${translateY}px)` } })}
      >
        <div className="col-start-1 col-span-12 lg:col-start-1 lg:col-span-9 flex items-start justify-between">
          <Link href="/" aria-label="Epitomestudio home">
            <Icon name="icon-logo" className="icon-logo fill-black dark:fill-natural h-5 transition-colors duration-lg ease-es" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266 24"><title>Epitomestudio</title></Icon>
          </Link>
          <button ref={menuButtonRef} className='lg:hidden p-3 -mr-3 -mt-3' onClick={toggleMobileMenu} aria-label="Toggle navigation menu" aria-expanded={isMobileMenu} aria-controls="mobile-navigation">
            {isMobileMenu ? (
              <Icon name="icon-close" className="icon-close fill-black dark:fill-natural h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Close</title></Icon>
            ) : (
              <Icon name="icon-burger" className="icon-burger fill-black dark:fill-natural h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Menu</title></Icon>
            )}
          </button>
        </div>

        <nav aria-label="Main navigation" className="col-start-10 col-span-3 lg:col-span-8 hidden lg:flex items-start justify-end gap-10">
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
              {navigation.map((item, index) => {
                const isActive = pathname === item.url && item.url !== '/'
                return (
                  <div key={item.label} className="fadein" style={{ animationDelay: `${index * 150}ms` }}>
                    <Link 
                      href={item.url} 
                      className={`link text-lg mobile-menu-content${isActive ? ' line' : ''}`} 
                      onClick={() => {
                        setIsContentFading(true)
                        setTimeout(() => {
                          closeMenu()
                        }, 960)
                      }} 
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </div>
                )
              })}
            </nav>
            <small className="col-start-1 col-span-12 lg:col-start-1 lg:col-span-16 link mobile-menu-content">&#169; {currentYear} {global?.companyName}</small>
          </>
        )}
      
      </header>
    </>
  )
}

