'use client'

import { useState } from 'react'
import { Icon } from '@/components/Icons'
import { EquipmentDarkMode } from '@/components/EquipmentDarkMode'

export default function SubscribePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!name.trim()) {
      setSubmitStatus('error')
      setErrorMessage('Please enter your name')
      return
    }

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
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to subscribe')
      }

      setSubmitStatus('success')
      setName('')
      setEmail('')
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <EquipmentDarkMode />
      <div className="grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-77.5 lg:max-w-100 flex flex-col gap-8">
          
          

          {submitStatus === 'success' ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-2 bg-black/5 dark:bg-natural/5 rounded p-6">
                <Icon name="icon-tick" className="icon-tick w-4 h-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Success</title></Icon>
                <div className="flex flex-col items-start gap-2">
                  <p>Thanks, you're on the list</p>
                  <div className="flex flex-col md:flex-row items-start gap-2 mt-4">
                    <a href="/studio-hire" className="btn self-start">
                        <span>Studio Hire</span>
                    </a>
                    <a href="/equipment-hire" className="btn self-start">
                        <span>Equipment Hire</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
                <h1 className="label text-center">
                Subscribe to our newsletter
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="field">
                    <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder=" "
                    required
                    />
                    <label htmlFor="name">Name</label>
                </div>

                <div className="field">
                    <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder=" "
                    required
                    />
                    <label htmlFor="email">Email</label>
                </div>

                {submitStatus === 'error' && errorMessage && (
                    <div className="flex items-start gap-2 text-sm">
                    <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                        <title>Error</title>
                    </Icon>
                    <p className="text-red">{errorMessage}</p>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn w-full"
                >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>

                </form>
                <p className="text-sm text-natural/80 text-center">By signing up, you confirm you have read and agree with our{' '} <a href="/legal/privacy-policy" target="_blank" className="underline">Privacy policy</a>.</p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
