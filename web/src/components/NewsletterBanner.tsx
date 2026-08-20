'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/Icons'

interface NewsletterBannerProps {
  settings?: {
    enabled?: boolean
    pageCountTrigger?: number
    heading?: string
    ctaText?: string
    emailPlaceholder?: string
    privacyText?: string
    successMessage?: string
  }
}

// Global state to allow external triggering
let openBannerCallback: (() => void) | null = null

export function openNewsletterBanner() {
  if (openBannerCallback) {
    openBannerCallback()
  }
}

export function NewsletterBanner({ settings }: NewsletterBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const pathname = usePathname()

  // Don't show banner on subscribe page
  if (pathname === '/subscribe') {
    return null
  }

  // Set up external trigger callback
  useEffect(() => {
    openBannerCallback = () => {
      setIsVisible(true)
      setIsOpening(true)
      setIsClosing(false)
    }
    return () => {
      openBannerCallback = null
    }
  }, [])

  // Page count tracking and auto-trigger logic
  useEffect(() => {
    const enabled = settings?.enabled ?? true
    if (!enabled) return

    const pageCountTrigger = settings?.pageCountTrigger ?? 2

    // Check if banner has been dismissed
    const dismissed = localStorage.getItem('newsletter-banner-dismissed')
    if (dismissed === 'true') return

    // Check if banner is already shown
    if (isVisible) return

    // Increment page count
    const currentCount = parseInt(sessionStorage.getItem('pageCount') || '0')
    const newCount = currentCount + 1
    sessionStorage.setItem('pageCount', newCount.toString())

    // Show banner if threshold reached (with delay for page load)
    if (newCount >= pageCountTrigger) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsOpening(true)
      }, 960) // duration-lg - matches page transition timing
      return () => clearTimeout(timer)
    }
  }, [pathname, settings, isVisible])

  // Trigger fade-in animation
  useEffect(() => {
    if (isOpening) {
      // Small delay to ensure initial state is rendered before transitioning
      const timer = setTimeout(() => {
        setIsOpening(false)
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [isOpening])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 480) // Match duration-md (480ms)
  }

  const handleDismiss = () => {
    localStorage.setItem('newsletter-banner-dismissed', 'true')
    handleClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSubmitStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Subscribe via Resend API
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to subscribe')
      }

      setSubmitStatus('success')
      
      // Close banner after success
      setTimeout(() => {
        localStorage.setItem('newsletter-banner-dismissed', 'true')
        handleClose()
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      handleDismiss()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isVisible])

  if (!isVisible) return null

  const heading = settings?.heading || 'Stay Updated'
  const ctaText = settings?.ctaText || 'Subscribe'
  const emailPlaceholder = settings?.emailPlaceholder || 'Enter your email'
  const privacyText = settings?.privacyText || 'By signing up, you confirm you have read and agree with our Privacy Policy.'
  const successMessage = settings?.successMessage || 'Thank you for subscribing!'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-natural/40 z-50 transition-opacity duration-md ease-es ${
          isOpening || isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleDismiss}
      />

      {/* Banner */}
      <div
        className={`newsletter-banner fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 aspect-4/5 w-[calc(100vw-2rem)] max-w-89.5 lg:max-w-125 bg-bamboo rounded p-4 lg:p-6 transition-opacity duration-md ease-es flex flex-col justify-center ${
          isOpening || isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Close Button */}
        <button onClick={handleDismiss} className="close absolute top-3 lg:top-5 right-3 lg:right-5">
          <Icon name="icon-close" className="icon-close w-3 h-3 fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
        </button>

        <div className="label text-natural absolute top-4 lg:top-6 left-4 lg:left-6">{heading}</div>

          {submitStatus === 'success' ? (
            <div className="">
                <p className="text-natural">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className='flex flex-col gap-4'>
                    <div className='flex gap-2 p-1 pl-4 rounded bg-natural/5'>
                        <label htmlFor="newsletter-email" className="sr-only">{emailPlaceholder}</label>
                        <input className='grow text-xl lg:text-label-lg placeholder:text-xl lg:placeholder:text-label-lg box-border text-natural focus:outline-none placeholder:text-natural/80 duration-lg ease-es min-w-0' type="email" id="newsletter-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={emailPlaceholder} required />
                        <button type="submit" disabled={isSubmitting} className="btn shrink-0 bg-black text-natural">{isSubmitting ? 'Subscribing...' : ctaText}</button>
                    </div>

                    {submitStatus === 'error' && errorMessage && (
                        <div className="note">
                            <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-black mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error</title></Icon>
                            <p className="text-sm text-black">{errorMessage}</p>
                        </div>
                    )}

                    <p className="text-sm text-natural/80 text-center">
                      {privacyText.includes('Privacy Policy') ? (
                        <>
                          {privacyText.split('Privacy Policy')[0]}
                          <a href="/legal/privacy-policy" target="_blank" className='underline'>Privacy Policy</a>
                          {privacyText.split('Privacy Policy')[1]}
                        </>
                      ) : (
                        privacyText
                      )}
                    </p>
                </div>

            </form>
          )}
      </div>
    </>
  )
}
