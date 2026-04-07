'use client'

import { useEffect, useState } from 'react'

export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check consent from localStorage
    const checkConsent = () => {
      try {
        const stored = localStorage.getItem('cookie_consent')
        if (stored) {
          const consent = JSON.parse(stored)
          setHasConsent(consent.analytics === true)
        }
      } catch (error) {
        console.error('Failed to check analytics consent:', error)
      }
    }

    // Check on mount
    checkConsent()

    // Listen for storage changes (when consent is updated)
    window.addEventListener('storage', checkConsent)
    
    // Custom event for same-tab updates
    window.addEventListener('cookieConsentUpdated', checkConsent)

    return () => {
      window.removeEventListener('storage', checkConsent)
      window.removeEventListener('cookieConsentUpdated', checkConsent)
    }
  }, [])

  if (!hasConsent) return null

  return (
    <>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-GYB0PFE8BQ"></script>
      <script dangerouslySetInnerHTML={{__html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-GYB0PFE8BQ');
      `}} />
    </>
  )
}
