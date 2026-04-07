'use client'

import { useEffect } from 'react'

// TypeScript declarations for Google Analytics
declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if scripts already loaded
    if (window.gtag) return

    const loadGoogleAnalytics = () => {
      try {
        const stored = localStorage.getItem('cookie_consent')
        if (!stored) return

        const consent = JSON.parse(stored)
        if (consent.analytics !== true) return

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || []
        window.gtag = function() { window.dataLayer!.push(arguments) }
        window.gtag('js', new Date())
        window.gtag('config', 'G-GYB0PFE8BQ')

        // Inject gtag script
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-GYB0PFE8BQ'
        document.head.appendChild(script)
      } catch (error) {
        console.error('Failed to load Google Analytics:', error)
      }
    }

    // Load on mount if consent exists
    loadGoogleAnalytics()

    // Listen for consent updates
    const handleConsentUpdate = () => {
      loadGoogleAnalytics()
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
