'use client'

import { useEffect } from 'react'

// TypeScript declarations for Facebook Pixel
declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: (...args: any[]) => void
  }
}

export function FacebookPixel() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if scripts already loaded
    if (window.fbq) return

    const loadFacebookPixel = () => {
      try {
        const stored = localStorage.getItem('cookie_consent')
        if (!stored) return

        const consent = JSON.parse(stored)
        if (consent.analytics !== true) return

        // Initialize Facebook Pixel
        window.fbq = function() {
          if (window.fbq) {
            (window.fbq as any).callMethod
              ? (window.fbq as any).callMethod.apply(window.fbq, arguments as any)
              : (window.fbq as any).queue.push(arguments)
          }
        }
        if (!window._fbq) window._fbq = window.fbq
        ;(window.fbq as any).push = window.fbq
        ;(window.fbq as any).loaded = true
        ;(window.fbq as any).version = '2.0'
        ;(window.fbq as any).queue = []

        // Inject pixel script
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        document.head.appendChild(script)

        // Initialize pixel with ID
        window.fbq('init', '1687981306665594')
        window.fbq('track', 'PageView')
      } catch (error) {
        console.error('Failed to load Facebook Pixel:', error)
      }
    }

    // Load on mount if consent exists
    loadFacebookPixel()

    // Listen for consent updates
    const handleConsentUpdate = () => {
      loadFacebookPixel()
    }

    window.addEventListener('storage', handleConsentUpdate)
    window.addEventListener('cookieConsentUpdated', handleConsentUpdate)

    return () => {
      window.removeEventListener('storage', handleConsentUpdate)
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate)
    }
  }, [])

  return null
}
