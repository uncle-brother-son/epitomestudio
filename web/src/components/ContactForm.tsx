'use client'

import { useState, FormEvent } from 'react'
import { Icon } from './Icons'

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Equipment Rental',
  'Studio Booking',
  'Production Services',
  'Technical Support',
  'Other',
]

const COUNTRY_CODES = [
  { code: '+44', country: 'UK' },
  { code: '+1', country: 'US/Canada' },
  { code: '+61', country: 'Australia' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' },
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
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
    <form onSubmit={handleSubmit}>

      <div className='field'>
        <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={status === 'loading'} placeholder="" />
        <label htmlFor="name">Name</label>
      </div>

      <div className='field'>
        <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={status === 'loading'} placeholder="" />
        <label htmlFor="email">Email</label>
      </div>

      <div className="field-row">
        <div className='field flex-1'>
          <select value={formData.countryCode} onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })} disabled={status === 'loading'}>
            {COUNTRY_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code}
              </option>
            ))}
          </select>
          <label htmlFor="countryCode">Country</label>
          <Icon name="icon-chevron" className="h-3 w-3 fill-black rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Dropdown</title></Icon>
        </div>
        <div className='field'>
          <input type="tel" id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={status === 'loading'} placeholder="" />
          <label htmlFor="phone">Phone Number</label>
        </div>
      </div>

      <div className='field'>
        <select id="subject" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} disabled={status === 'loading'}>
          <option value=""></option>
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label htmlFor="subject">Select a subject</label>
        <Icon name="icon-chevron" className="h-3 w-3 fill-black rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Dropdown</title></Icon>
      </div>

      <div className='field'>
        <textarea id="message" required rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} disabled={status === 'loading'} placeholder="" />
        <label htmlFor="message">Message</label>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn self-end mt-4">
        {status === 'loading' ? 'Sending...' : 'Send'}
      </button>

      {/* Success Message */}
      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">✓ Message sent successfully! We'll get back to you soon.</p>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">✗ {errorMessage || 'Failed to send message. Please try again.'}</p>
        </div>
      )}
    </form>
  )
}
