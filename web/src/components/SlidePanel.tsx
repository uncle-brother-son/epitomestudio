'use client'

import { useEffect, useState, ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function SlidePanel({ isOpen, onClose, children }: Props) {
  const [showBackdrop, setShowBackdrop] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowBackdrop(true)
          setShowPanel(true)
        })
      })
    } else {
      setShowBackdrop(false)
      setShowPanel(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 480)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Lock scrolling with position fixed (more reliable on mobile)
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      
      // Prevent layout shift from scrollbar disappearing
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      
      return () => {
        // Restore scroll position
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        window.scrollTo(0, scrollY)
      }
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
      <div 
        className={`fixed inset-0 bg-black/20 dark:bg-natural/20 z-40 transition-opacity duration-md ease-es ${
          showBackdrop ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide Panel - with doubled top offset */}
      <div 
        className={`fixed inset-x-0 top-13.5 lg:top-13.5 h-[calc(100dvh-6.625rem)] lg:h-[calc(100dvh-8.375rem)] bg-natural dark:bg-black z-50 transform transition-transform duration-md ease-es flex flex-col ${
          showPanel ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {children}
      </div>
    </>
  )
}
