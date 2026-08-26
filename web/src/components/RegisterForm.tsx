'use client'

import { useState } from 'react'
import { Icon } from '@/components/Icons'
import { EquipmentDarkMode } from '@/components/EquipmentDarkMode'
import { SlidePanel } from '@/components/SlidePanel'
import { EquipmentTerms } from '@/components/EquipmentTerms'
import { AnimatedMessage } from '@/components/AnimatedMessage'
import { COUNTRY_CODES } from '@/lib/constants'
import type { Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'

interface FormData {
  name: string
  businessType: string
  companyName: string
  vatNumber: string
  email: string
  countryCode: string
  phoneNumber: string
  address1: string
  address2: string
  city: string
  postcode: string
  country: string
  agreeToTerms: boolean
  subscribeToNewsletter: boolean
}

interface Props {
  equipment?: Equipment | null
  global?: Global | null
}

export function RegisterForm({ equipment, global }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [isTermsDrawerOpen, setIsTermsDrawerOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessType: '',
    companyName: '',
    vatNumber: '',
    email: '',
    countryCode: '+44',
    phoneNumber: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    agreeToTerms: false,
    subscribeToNewsletter: false
  })

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Please select your business type'
    }
    if (formData.businessType === 'company' && !formData.companyName.trim()) {
      newErrors.companyName = 'Please enter your company name'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter your phone number'
    }
    if (!formData.address1.trim()) {
      newErrors.address1 = 'Please enter your address'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city'
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Please enter your postcode'
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Please enter your country'
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Equipment Hire Policy to continue'
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to register')
      }

      const result = await response.json()
      if (result.referenceNumber) {
        setRefNumber(result.referenceNumber)
      }

      // Track Facebook Pixel event
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'CompleteRegistration', {
          content_name: 'Account Registration',
          status: 'completed'
        })
      }

      setIsSuccess(true)
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ email: error instanceof Error ? error.message : 'Failed to register. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSuccess(false)
    setRefNumber('')
    setFormData({
      name: '',
      businessType: '',
      companyName: '',
      vatNumber: '',
      email: '',
      countryCode: '+44',
      phoneNumber: '',
      address1: '',
      address2: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
      agreeToTerms: false,
      subscribeToNewsletter: false
    })
    setErrors({})
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col">
        <EquipmentDarkMode />
        <div className="grow flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-77.5 lg:max-w-100 flex flex-col gap-8">
            <div className="flex items-start gap-2 bg-black/5 dark:bg-natural/5 rounded p-6">
              <Icon name="icon-tick" className="icon-tick w-4 h-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                <title>Success</title>
              </Icon>
              <div className="flex flex-col items-start gap-2">
                <p>Thank you for registering with EPITOMESTUDIO.</p>
                <p>REF Number: {refNumber}</p>
                <p>We have sent you an email with all the details, and a member of our team will be in touch shortly to complete your account setup.</p>
                <button onClick={handleReset} className="btn self-start mt-4">
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen flex flex-col">
        <EquipmentDarkMode />
        <div className="grow flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-77.5 lg:max-w-100 flex flex-col gap-8">
            
            <h1 className="label text-center">
              Register for Account
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              
              {/* Name */}
              <div className='field-wrapper'>
                <div className="field">
                  <input 
                    type="text" 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => updateField('name', e.target.value)} 
                    placeholder=" "
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  <label htmlFor="name">Name</label>
                </div>
                <AnimatedMessage show={!!errors.name} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="name-error">{errors.name}</span>
                </AnimatedMessage>
              </div>

              {/* Business Type */}
              <div className='field-wrapper'>
                <div className="field">
                  <select 
                    id="businessType" 
                    value={formData.businessType} 
                    onChange={(e) => updateField('businessType', e.target.value)}
                    aria-invalid={!!errors.businessType}
                    aria-describedby={errors.businessType ? "businessType-error" : undefined}
                    required
                  >
                    <option value=""></option>
                    <option value="company">Company</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  <label htmlFor="businessType">Business Type</label>
                  <Icon name="icon-chevron" className="icon-chevron h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Dropdown</title>
                  </Icon>
                </div>
                <AnimatedMessage show={!!errors.businessType} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="businessType-error">{errors.businessType}</span>
                </AnimatedMessage>
              </div>

              {/* Company Name (conditional) */}
              {formData.businessType === 'company' && (
                <div className='field-wrapper'>
                  <div className="field">
                    <input 
                      type="text" 
                      id="companyName" 
                      value={formData.companyName} 
                      onChange={(e) => updateField('companyName', e.target.value)} 
                      placeholder=" "
                      aria-invalid={!!errors.companyName}
                      aria-describedby={errors.companyName ? "companyName-error" : undefined}
                    />
                    <label htmlFor="companyName">Company Name</label>
                  </div>
                  <AnimatedMessage show={!!errors.companyName} className="error">
                    <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                      <title>Error note</title>
                    </Icon>
                    <span id="companyName-error">{errors.companyName}</span>
                  </AnimatedMessage>
                </div>
              )}

              {/* VAT Number (conditional, optional) */}
              {formData.businessType === 'company' && (
                <div className="field">
                  <input 
                    type="text" 
                    id="vatNumber" 
                    value={formData.vatNumber} 
                    onChange={(e) => updateField('vatNumber', e.target.value)} 
                    placeholder=" "
                  />
                  <label htmlFor="vatNumber">VAT Number (optional)</label>
                </div>
              )}

              {/* Email */}
              <div className='field-wrapper'>
                <div className="field">
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email} 
                    onChange={(e) => updateField('email', e.target.value)} 
                    placeholder=" "
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  <label htmlFor="email">Email address</label>
                </div>
                <AnimatedMessage show={!!errors.email} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="email-error">{errors.email}</span>
                </AnimatedMessage>
              </div>

              {/* Phone Number */}
              <div className='field-wrapper'>
                <div className="field-row">
                  <div className="field flex-3 preselect">
                    <select 
                      id="countryCode" 
                      value={formData.countryCode} 
                      onChange={(e) => updateField('countryCode', e.target.value)}
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="countryCode">Country Code</label>
                    <Icon name="icon-chevron" className="icon-chevron h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                      <title>Dropdown</title>
                    </Icon>
                  </div>
                  <div className="field flex-6">
                    <input 
                      type="tel" 
                      id="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={(e) => updateField('phoneNumber', e.target.value)} 
                      placeholder=" "
                      aria-invalid={!!errors.phoneNumber}
                      aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                    />
                    <label htmlFor="phoneNumber">Phone Number</label>
                  </div>
                </div>
                <AnimatedMessage show={!!errors.phoneNumber} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="phoneNumber-error">{errors.phoneNumber}</span>
                </AnimatedMessage>
              </div>

              {/* Address 1 */}
              <div className='field-wrapper'>
                <div className="field">
                  <input 
                    type="text" 
                    id="address1" 
                    value={formData.address1} 
                    onChange={(e) => updateField('address1', e.target.value)} 
                    placeholder=" "
                    aria-invalid={!!errors.address1}
                    aria-describedby={errors.address1 ? "address1-error" : undefined}
                  />
                  <label htmlFor="address1">Address 1</label>
                </div>
                <AnimatedMessage show={!!errors.address1} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="address1-error">{errors.address1}</span>
                </AnimatedMessage>
              </div>

              {/* Address 2 */}
              <div className="field">
                <input 
                  type="text" 
                  id="address2" 
                  value={formData.address2} 
                  onChange={(e) => updateField('address2', e.target.value)} 
                  placeholder=" "
                />
                <label htmlFor="address2">Address 2 (optional)</label>
              </div>

              {/* City & Postcode */}
              <div className='field-wrapper'>
                <div className="field-row">
                  <div className="field grow">
                    <input 
                      type="text" 
                      id="city" 
                      value={formData.city} 
                      onChange={(e) => updateField('city', e.target.value)} 
                      placeholder=" "
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? "city-error" : undefined}
                    />
                    <label htmlFor="city">City</label>
                  </div>
                  <div className="field grow">
                    <input 
                      type="text" 
                      id="postcode" 
                      value={formData.postcode} 
                      onChange={(e) => updateField('postcode', e.target.value)} 
                      placeholder=" "
                      aria-invalid={!!errors.postcode}
                      aria-describedby={errors.postcode ? "postcode-error" : undefined}
                    />
                    <label htmlFor="postcode">Post code</label>
                  </div>
                </div>
                <AnimatedMessage show={!!errors.city || !!errors.postcode} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="city-error">{errors.city || errors.postcode}</span>
                </AnimatedMessage>
              </div>

              {/* Country */}
              <div className='field-wrapper'>
                <div className="field">
                  <input 
                    type="text" 
                    id="country" 
                    value={formData.country} 
                    onChange={(e) => updateField('country', e.target.value)} 
                    placeholder=" "
                    aria-invalid={!!errors.country}
                    aria-describedby={errors.country ? "country-error" : undefined}
                  />
                  <label htmlFor="country">Country</label>
                </div>
                <AnimatedMessage show={!!errors.country} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                    <title>Error note</title>
                  </Icon>
                  <span id="country-error">{errors.country}</span>
                </AnimatedMessage>
              </div>

              {/* Checkboxes */}
              <div className='flex flex-col gap-4 mt-4'>
                <div className='field-wrapper'>
                  <label className='checkbox-simple'>
                    <input 
                      type='checkbox' 
                      checked={formData.agreeToTerms} 
                      onChange={(e) => updateField('agreeToTerms', e.target.checked)} 
                    />
                    <Icon name="icon-tick" className="icon-tick h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
                      <title>Check</title>
                    </Icon>
                    <span>Equipment hire is subject to agreement with our <button type="button" className="underline" onClick={(e) => { e.preventDefault(); setIsTermsDrawerOpen(true); }}>Equipment Hire Policy</button></span>
                  </label>
                  <AnimatedMessage show={!!errors.agreeToTerms} className="error">
                    <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true">
                      <title>Error note</title>
                    </Icon>
                    <span id="agreeToTerms-error">{errors.agreeToTerms}</span>
                  </AnimatedMessage>
                </div>

                <label className='checkbox-simple'>
                  <input 
                    type='checkbox' 
                    checked={formData.subscribeToNewsletter} 
                    onChange={(e) => updateField('subscribeToNewsletter', e.target.checked)} 
                  />
                  <Icon name="icon-tick" className="icon-tick h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
                    <title>Check</title>
                  </Icon>
                  <span>Sign up to our newsletter to receive updates.</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn w-full mt-4"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>

            </form>
          </div>
        </div>
      </main>

      {/* Terms Slide Panel */}
      {equipment && global && (
        <SlidePanel isOpen={isTermsDrawerOpen} onClose={() => setIsTermsDrawerOpen(false)}>
          <EquipmentTerms onClose={() => setIsTermsDrawerOpen(false)} equipment={equipment} global={global} />
        </SlidePanel>
      )}
    </>
  )
}
