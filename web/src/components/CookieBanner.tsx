'use client'

import { useState, useEffect } from 'react'
import { useCookieConsent } from '@/contexts/CookieConsentContext'

export function CookieBanner() {
  const { showBanner, updateConsent } = useCookieConsent()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Trigger entrance animation after mount
  useEffect(() => {
    if (showBanner) {
      // Delay to allow initial render, then trigger animation
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showBanner])

  const handleConsent = (analytics: boolean) => {
    setIsExiting(true)
    
    // Wait for exit animation to complete before updating consent
    setTimeout(() => {
      updateConsent(analytics)
    }, 960) // duration-lg
  }

  if (!showBanner) return null

  return (
    <div className={`cookie-banner fixed bottom-0 left-0 right-0 z-50 p-4 lg:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] transition-all ease-es ${
      isExiting 
        ? 'opacity-0 translate-y-full duration-lg' 
        : isVisible 
          ? 'opacity-100 translate-y-0 duration-lg delay-md' 
          : 'opacity-0 translate-y-full'
    }`}>
        <div className="bg-black dark:bg-natural text-natural dark:text-black rounded px-4 py-6 flex flex-col gap-6 w-full lg:w-[calc(((100vw-216px)/3)+56px)] shadow-lg transition-colors duration-lg ease-es">
            <div className="flex-1">
                <h3 className="label mb-4">Cookie Preferences</h3>
                <p>We use cookies to improve your experience. Essential cookies are always active. Analytics cookies help us understand how you use our site.</p>
            </div>
            <div className="flex flex-row gap-2">
                <button onClick={() => handleConsent(false)} className="grow btn-outline"><span>Reject</span></button>
                <button onClick={() => handleConsent(true)} className="grow btn"><span>Accept</span></button>
            </div>
        </div>
    </div>
  )
}
