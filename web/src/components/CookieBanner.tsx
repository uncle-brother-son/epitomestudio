'use client'

import { useCookieConsent } from '@/contexts/CookieConsentContext'

export function CookieBanner() {
  const { showBanner, updateConsent } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div className="cookie-banner fixed bottom-0 left-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="bg-black dark:bg-natural text-natural dark:text-black rounded px-4 py-6 flex flex-col gap-6 w-full lg:w-[calc(((100vw-216px)/3)+56px)] shadow-lg transition-colors duration-lg ease-es">
            <div className="flex-1">
                <h3 className="label mb-4">Cookie Preferences</h3>
                <p>We use cookies to improve your experience. Essential cookies are always active. Analytics cookies help us understand how you use our site.</p>
            </div>
            <div className="flex flex-row gap-2">
                <button onClick={() => updateConsent(false)} className="grow btn-outline"><span>Reject</span></button>
                <button onClick={() => updateConsent(true)} className="grow btn"><span>Accept</span></button>
            </div>
        </div>
    </div>
  )
}
