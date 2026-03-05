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
        className={`fixed inset-0 bg-black/20 dark:bg-natural/20 z-50 transition-opacity duration-md ease-es ${
          showBackdrop ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide Panel - with doubled top offset */}
      <div 
        className={`fixed inset-x-0 top-13.5 lg:top-13.5 h-[calc(100vh-6.625rem)] lg:h-[calc(100vh-8.375rem)] bg-natural dark:bg-black z-50 transform transition-transform duration-md ease-es flex flex-col ${
          showPanel ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {children}
      </div>
    </>
  )
}
