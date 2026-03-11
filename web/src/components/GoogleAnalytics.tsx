'use client'

import { useEffect, useState } from 'react'

export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check consent from localStorage
    try {
      const stored = localStorage.getItem('cookie_consent')
      if (stored) {
        const consent = JSON.parse(stored)
        setHasConsent(consent.analytics === true)
      }
    } catch (error) {
      console.error('Failed to check analytics consent:', error)
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
