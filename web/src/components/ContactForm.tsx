'use client'

import { useState, FormEvent } from 'react'
import { Icon } from './Icons'
import { AnimatedMessage } from './AnimatedMessage'
import { COUNTRY_CODES } from '@/lib/constants'

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Equipment Rental',
  'Studio Booking',
  'Production Services',
  'Technical Support',
  'Other',
]

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+44',
    phone: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({})

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.subject) {
      newErrors.subject = 'Please select a subject'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message'
    }
    
    return newErrors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setErrors({})
        setFormData({ 
          name: '', 
          email: '', 
          countryCode: '+44',
          phone: '',
          subject: '',
          message: '' 
        })
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Failed to send message')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Network error. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      <div className='field-wrapper'>
        <div className='field'>
          <input type="text" id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} disabled={status === 'loading'} placeholder="" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          <label htmlFor="name">Name</label>
        </div>
        <AnimatedMessage show={!!errors.name} className="flex items-center gap-2 error">
          <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
          <span id="name-error">{errors.name}</span>
        </AnimatedMessage>
      </div>

      <div className='field-wrapper'>
        <div className='field'>
          <input type="email" id="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} disabled={status === 'loading'} placeholder="" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          <label htmlFor="email">Email</label>
        </div>
        <AnimatedMessage show={!!errors.email} className="flex items-center gap-2 error">
          <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
          <span id="email-error">{errors.email}</span>
        </AnimatedMessage>
      </div>

      <div className="field-row">
        <div className='field flex-1'>
          <select value={formData.countryCode} onChange={(e) => updateField('countryCode', e.target.value)} disabled={status === 'loading'}>
            {COUNTRY_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code}
              </option>
            ))}
          </select>
          <label htmlFor="countryCode">Country</label>
          <Icon name="icon-chevron" className="h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Dropdown</title></Icon>
        </div>
        <div className='field'>
          <input type="tel" id="phone" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} disabled={status === 'loading'} placeholder="" />
          <label htmlFor="phone">Phone Number</label>
        </div>
      </div>

      <div className='field-wrapper'>
        <div className='field'>
          <select id="subject" value={formData.subject} onChange={(e) => updateField('subject', e.target.value)} disabled={status === 'loading'} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} required>
            <option value=""></option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label htmlFor="subject">Select a subject</label>
          <Icon name="icon-chevron" className="h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Dropdown</title></Icon>
        </div>
        <AnimatedMessage show={!!errors.subject} className="flex items-center gap-2 error">
          <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
          <span id="subject-error">{errors.subject}</span>
        </AnimatedMessage>
      </div>

      <div className='field-wrapper'>
        <div className='field'>
          <textarea id="message" rows={6} value={formData.message} onChange={(e) => updateField('message', e.target.value)} disabled={status === 'loading'} placeholder="" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
          <label htmlFor="message">Message</label>
        </div>
        <AnimatedMessage show={!!errors.message} className="flex items-center gap-2 error">
          <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
          <span id="message-error">{errors.message}</span>
        </AnimatedMessage>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn self-end mt-4">
        {status === 'loading' ? 'Sending...' : 'Send'}
      </button>

      <AnimatedMessage show={status === 'success'} className="flex items-center gap-2 note mt-4">
        <Icon name="icon-subArrow" className="h-3 w-3 fill-green mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Success</title></Icon>
        <span>Message sent successfully! We'll get back to you soon.</span>
      </AnimatedMessage>

      <AnimatedMessage show={status === 'error'} className="flex items-center gap-2 error mt-4">
        <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error</title></Icon>
        <span>{errorMessage || 'Failed to send message. Please try again.'}</span>
      </AnimatedMessage>
    </form>
  )
}
