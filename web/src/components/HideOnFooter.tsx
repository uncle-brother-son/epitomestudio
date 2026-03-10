'use client'

import React, { useEffect, useState, type ReactNode } from 'react'

interface HideOnFooterProps {
  children: ReactNode
  className?: string
  translateAmount?: string
}

export function HideOnFooter({ children, className = '', translateAmount = 'translate-y-20' }: HideOnFooterProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Only set up the observer on mobile
    if (!isMobile) {
      setIsVisible(true)
      return
    }

    const footer = document.querySelector('footer')
    if (!footer) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting)
      },
      {
        rootMargin: '0px',
        threshold: 0.01,
      }
    )

    observer.observe(footer)

    return () => observer.disconnect()
  }, [isMobile])

  // Clone the child element and add the animation classes
  const child = children as React.ReactElement<{ className?: string }>
  return (
    <>
      {React.cloneElement(child, {
        className: `${child.props.className || ''} ${className} transition-transform duration-lg ease-es ${
          isMobile && !isVisible ? translateAmount : 'translate-y-0'
        }`.trim()
      })}
    </>
  )
}
