'use client'

import { useEffect, useState, ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Drawer({ isOpen, onClose, children }: Props) {
  const [showBackdrop, setShowBackdrop] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Animate in: backdrop and drawer simultaneously
  // Animate out: backdrop and drawer simultaneously
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Double RAF needed for CSS transition to fire
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowBackdrop(true)
          setShowDrawer(true)
        })
      })
    } else {
      setShowBackdrop(false)
      setShowDrawer(false)
      // Wait for animations to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 480) // duration-md
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Lock scrolling on both html and body
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      
      // Prevent layout shift from scrollbar disappearing
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/40 dark:bg-natural/40 z-40 transition-opacity duration-md ease-es ${ showBackdrop ? 'opacity-100' : 'opacity-0' }`} onClick={onClose} />

      {/* Drawer */}
      <div className={`fixed inset-x-0 top-20 lg:top-20 h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] bg-natural dark:bg-black z-50 transform transition-transform duration-md ease-es flex flex-col ${ showDrawer ? 'translate-y-0' : 'translate-y-full' }`}>
        {children}
      </div>
    </>
  )
}
