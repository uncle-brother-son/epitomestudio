'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  timestamp: number
}

interface CookieConsentContextType {
  consent: CookieConsent | null
  hasConsent: (category: keyof CookieConsent) => boolean
  updateConsent: (analytics: boolean) => void
  showBanner: boolean
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

const STORAGE_KEY = 'cookie_consent'
const CONSENT_TTL = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds

const defaultConsent: CookieConsent = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  timestamp: Date.now()
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: CookieConsent = JSON.parse(stored)
        const now = Date.now()
        
        // Check if consent is still valid (within TTL)
        if (now - parsed.timestamp < CONSENT_TTL) {
          setConsent(parsed)
          setShowBanner(false)
        } else {
          // Consent expired, show banner again
          localStorage.removeItem(STORAGE_KEY)
          setShowBanner(true)
        }
      } else {
        // No consent stored, show banner
        setShowBanner(true)
      }
    } catch (error) {
      console.error('Failed to load cookie consent:', error)
      setShowBanner(true)
    }
    
    setIsHydrated(true)
  }, [])

  // Save consent to localStorage
  const saveConsent = (newConsent: CookieConsent) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent))
      setConsent(newConsent)
    } catch (error) {
      console.error('Failed to save cookie consent:', error)
    }
  }

  const updateConsent = (analytics: boolean) => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics,
      timestamp: Date.now()
    }
    saveConsent(newConsent)
    setShowBanner(false)

    // Reload page if analytics consent changed to load/unload GA
    if (consent?.analytics !== analytics) {
      window.location.reload()
    }
  }

  const hasConsent = (category: keyof CookieConsent): boolean => {
    if (!consent) return category === 'necessary'
    return consent[category]
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsent,
        updateConsent,
        showBanner: isHydrated && showBanner
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}
