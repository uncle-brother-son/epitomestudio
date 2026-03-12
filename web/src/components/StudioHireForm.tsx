'use client'

import { useState } from 'react'
import { saveHireStudioData } from '@/lib/formStorage'
import { Icon } from './Icons'
import { AnimatedMessage } from './AnimatedMessage'
import { COUNTRY_CODES } from '@/lib/constants'
import { SlidePanel } from './SlidePanel'
import { StudioTerms } from './StudioTerms'
import type { Studio } from '@/queries/studio'
import type { Global } from '@/queries/global'

interface FormData {
  // Step 1: Your Info
  name: string
  businessType: string
  companyName: string
  email: string
  countryCode: string
  phoneNumber: string
  
  // Step 2: Studio Enquiry
  hireStartDate: string
  days: number
  arrivalTime: string
  leavingTime: string
  typeOfBooking: string
  attendees: number
  hireEquipment: boolean
  message: string
  
  // Checkboxes
  agreeToTerms: boolean
  subscribeToNewsletter: boolean
}

interface Props {
  onClose: () => void
  studio?: Studio | null
  global?: Global | null
}

export function StudioHireForm({ onClose, studio, global }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isTermsDrawerOpen, setIsTermsDrawerOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessType: '',
    companyName: '',
    email: '',
    countryCode: '+44',
    phoneNumber: '',
    hireStartDate: '',
    days: 1,
    arrivalTime: '09:00',
    leavingTime: '18:00',
    typeOfBooking: '',
    attendees: 10,
    hireEquipment: false,
    message: '',
    agreeToTerms: false,
    subscribeToNewsletter: false
  })

  const today = new Date().toISOString().split('T')[0]

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = date.toLocaleString('en-GB', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const capitalizeFirst = (str: string) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const formatTypeOfBooking = (type: string) => {
    const typeMap: Record<string, string> = {
      'photo': 'Photo Shoot',
      'video': 'Video Shoot',
      'hybrid': 'Photo & Video Shoot',
      'event': 'Event',
      'other': 'Other'
    }
    return typeMap[type] || type
  }

  const validateStep1 = () => {
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
    return newErrors
  }

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!formData.hireStartDate) {
      newErrors.hireStartDate = 'Hire start date is required'
    }
    if (!formData.typeOfBooking) {
      newErrors.typeOfBooking = 'Type of booking is required'
    }    
    return newErrors
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const validationErrors = validateStep1()
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    } else if (currentStep === 2) {
      const validationErrors = validateStep2()
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }
    
    if (currentStep < 3) {
      setErrors({})
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setTimeout(() => setIsTransitioning(false), 10)
      }, 240)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setTimeout(() => setIsTransitioning(false), 10)
      }, 240)
    }
  }

  const handleSubmit = async () => {
    // Validate terms agreement
    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: 'You must agree to the Studio Hire Policy to continue' })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit to API
      const response = await fetch('/api/hire-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Submission failed')

      // If user wants to hire equipment, save data to localStorage
      if (formData.hireEquipment) {
        saveHireStudioData(formData)
      }

      setIsSuccess(true)
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="grow flex flex-col pt-20">
        
        <button onClick={onClose} className="close absolute top-4 right-4">
          <span>Close</span><Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
        </button>

        <div className="grow grid_ gap-y-6 overflow-y-scroll lg:overflow-y-auto">
          <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-4 mt-9 px-2 lg:px-0">
            <div className="flex items-start gap-2 bg-black/10 dark:bg-natural/10 rounded p-6">
              <Icon name="icon-tick" className="icon-tick w-4 h-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Success</title></Icon>
              <div className="flex flex-col items-start gap-2">
                <p>Thanks, we have received your Studio Hire enquiry.</p>
                <p>We'll get back to you soon.</p>
                {formData.hireEquipment && (
                  <div className="flex flex-col gap-6 mt-4">
                      <p>Please select your equipment and submit a Hire Equipment form by clicking the link below.</p>
                      <a href="/equipment-hire" onClick={onClose} className="btn self-start">Browse Equipment</a>
                  </div>
                )}
                {!formData.hireEquipment && (
                  <button onClick={onClose} className="btn self-start mt-4">
                      <span>Done</span>
                  </button>
                )}
              </div>        
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="grow flex flex-col gap-6 pt-20 px-2 lg:px-0 min-h-0">
      
      <button onClick={onClose} className="close absolute top-4 right-4">
        <span>Close</span><Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
      </button>
      
      <div className="grid_">
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-row gap-2 justify-start items-center">
          <button onClick={() => setCurrentStep(1)} className={`label transition-opacity duration-md ease-es ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'} ${currentStep > 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`} >Your Info</button>
          <Icon name="icon-chevron" className="icon-chevron w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Arrow Right</title></Icon>
          <button onClick={() => currentStep > 2 && setCurrentStep(2)} className={`label transition-opacity duration-md ease-es ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'} ${currentStep > 2 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>Studio Enquiry</button>
          <Icon name="icon-chevron" className="icon-chevron w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Arrow Right</title></Icon>
          <button className={`label transition-opacity duration-md ease-es ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'} cursor-default`}>Review</button> 
        </div>
      </div>

      <div className="grid_ gap-y-6 overflow-y-scroll pb-8">

        {/* Step 1: Your Info */}
        {currentStep === 1 && (
          <div className={`col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-2 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          
            <div className='field-wrapper'>
              <div className="field">
                <input type="text" id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder=" " aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                <label htmlFor="name">Name</label>
              </div>
              <AnimatedMessage show={!!errors.name} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="name-error">{errors.name}</span>
              </AnimatedMessage>
            </div>

            <div className='field-wrapper'>
              <div className="field">
                <select id="businessType" value={formData.businessType} onChange={(e) => updateField('businessType', e.target.value)} aria-invalid={!!errors.businessType} aria-describedby={errors.businessType ? "businessType-error" : undefined} required>
                    <option value=""></option>
                    <option value="company">Company</option>
                    <option value="freelance">Freelance</option>
                </select>
                <label htmlFor="businessType">Business Type</label>
                <Icon name="icon-chevron" className="icon-chevron h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <AnimatedMessage show={!!errors.businessType} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="businessType-error">{errors.businessType}</span>
              </AnimatedMessage>
            </div>

            {formData.businessType === 'company' && (
              <>
                <div className='field-wrapper'>
                  <div className="field">
                    <input type="text" id="companyName" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} placeholder=" " aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? "companyName-error" : undefined} />
                    <label htmlFor="companyName">Company Name</label>
                  </div>
                  <AnimatedMessage show={!!errors.companyName} className="error">
                    <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                    <span id="companyName-error">{errors.companyName}</span>
                  </AnimatedMessage>
                </div>
              </>
            )}

            <div className='field-wrapper'>
              <div className="field">
                <input type="email" id="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder=" " aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                <label htmlFor="email">Email</label>
              </div>
              <AnimatedMessage show={!!errors.email} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="email-error">{errors.email}</span>
              </AnimatedMessage>
            </div>

            <div className="field-row">
              <div className="field flex-3 preselect">
                <select id="countryCode" value={formData.countryCode} onChange={(e) => updateField('countryCode', e.target.value)}>
                  {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                      {item.code}
                  </option>
                  ))}
                </select>
                <label htmlFor="countryCode">Country Code</label>
                <Icon name="icon-chevron" className="icon-chevron h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <div className="field flex-6">
                <input type="tel" id="phoneNumber" value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} placeholder=" " />
                <label htmlFor="phoneNumber">Phone Number</label>
              </div>
            </div>

            <button onClick={handleNext} className="btn self-end mt-4">
              <span>Next</span>
              <Icon name="icon-arrow" className="icon-arrow w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Next</title></Icon>
            </button>
          </div>
        )}

        {/* Step 2: Studio Enquiry */}
        {currentStep === 2 && (
          <div className={`col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-2 justify-start transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

            <div className='field-wrapper'>
              <div className="field-row">
                <div className="basis-1/2 field">
                  <input type="date" id="hireStartDate" value={formData.hireStartDate} onChange={(e) => updateField('hireStartDate', e.target.value)} min={today} placeholder=" " aria-invalid={!!errors.hireStartDate} aria-describedby={errors.hireStartDate ? "hireStartDate-error" : undefined} />
                  <label htmlFor="hireStartDate">Hire Start Date</label>
                  <Icon name="icon-date" className="icon-date h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Date Picker</title></Icon>
                </div>
                <div className="basis-1/2 flex flex-row items-center justify-between bg-black/10 dark:bg-natural/10 rounded px-4 py-3.5">
                  <label className="text-lg opacity-60">Days</label>
                  <div className="flex flex-row gap-1.5 items-center">
                    <button type="button" className={`qty-form ${formData.days === 1 ? 'opacity-60' : ''}`} onClick={() => updateField('days', Math.max(1, formData.days - 1))}>
                      <Icon name="icon-minus" className="icon-minus w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease</title></Icon>
                    </button>
                    <span className="text-lg w-4 text-center">{formData.days}</span>
                    <button type="button" className="qty-form" onClick={() => updateField('days', formData.days + 1)}>
                      <Icon name="icon-plus" className="icon-plus w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Increase</title></Icon>
                    </button>
                  </div>
                </div>
              </div>
              <AnimatedMessage show={!!errors.hireStartDate} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="hireStartDate-error">{errors.hireStartDate}</span>
              </AnimatedMessage>
            </div>

            <div className="field-row">
              <div className="field grow">
                <input type="time" id="arrivalTime" value={formData.arrivalTime} onChange={(e) => updateField('arrivalTime', e.target.value)} placeholder=" " step="900" />
                <label htmlFor="arrivalTime">Arrival Time</label>
                <Icon name="icon-time" className="icon-time h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Time Picker</title></Icon>
              </div>
              <div className="field grow">
                <input type="time" id="leavingTime" value={formData.leavingTime} onChange={(e) => updateField('leavingTime', e.target.value)} placeholder=" " step="900" />
                <label htmlFor="leavingTime">Leaving Time</label>
                <Icon name="icon-time" className="icon-time h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Time Picker</title></Icon>
              </div>
            </div>

            <div className='field-wrapper'>
              <div className="field">
                <select id="typeOfBooking" value={formData.typeOfBooking} onChange={(e) => updateField('typeOfBooking', e.target.value)} aria-invalid={!!errors.typeOfBooking} aria-describedby={errors.typeOfBooking ? "typeOfBooking-error" : undefined} required>
                  <option value=""></option>
                  <option value="photo">Photo Shoot</option>
                  <option value="video">Video Shoot</option>
                  <option value="hybrid">Photo & Video Shoot</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
                <label htmlFor="typeOfBooking">Type of Booking</label>
                <Icon name="icon-chevron" className="icon-chevron h-4 w-4 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <AnimatedMessage show={!!errors.typeOfBooking} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="typeOfBooking-error">{errors.typeOfBooking}</span>
              </AnimatedMessage>
            </div>

            <div className="flex flex-row items-center justify-between bg-black/10 dark:bg-natural/10 rounded px-4 py-3.75 lg:py-3.5">
              <label className="text-xl lg:text-lg opacity-60">Attendees</label>
              <div className="flex flex-row gap-1.5 items-center">
                <button type="button" className={`qty-form ${formData.attendees === 10 ? 'opacity-60' : ''}`} onClick={() => updateField('attendees', Math.max(10, formData.attendees - 10))}>
                  <Icon name="icon-minus" className="icon-minus w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease</title></Icon>
                </button>
                <span className="text-lg w-4 text-center">{formData.attendees}</span>
                <button type="button" className={`qty-form ${formData.attendees === 40 ? 'opacity-60' : ''}`} onClick={() => updateField('attendees', Math.min(40, formData.attendees + 10))}>
                  <Icon name="icon-plus" className="icon-plus w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Increase</title></Icon>
                </button>
              </div>
            </div>

            <div className='field-wrapper'>
              <div className="field">
                <input type="checkbox" id="hireEquipment" checked={formData.hireEquipment} onChange={(e) => updateField('hireEquipment', e.target.checked)} className="sr-only" />
                <label htmlFor="hireEquipment" className="flex flex-row items-center justify-between cursor-pointer text-xl lg:text-lg static bg-black/10 dark:bg-natural/10 rounded px-4 py-3.25 lg:py-3">
                  <div>Hire Equipment</div>
                  <div className='flex flex-row gap-2 items-center justify-center'>
                    <div className='text-black dark:text-natural'>{formData.hireEquipment ? 'Yes' : 'No'}</div>
                    <div className='h-6 w-12 rounded bg-black/10 dark:bg-natural/10 relative'>
                      <div className={`h-5 w-5 rounded absolute top-0.5 transition-all duration-md ease-es ${formData.hireEquipment ? 'left-6.5 bg-green' : 'left-0.5 bg-red'}`} />
                    </div>
                  </div>
                </label>
              </div>
              <AnimatedMessage show={formData.hireEquipment} className="note">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-black/60 dark:fill-natural/60 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Hire Equipment note</title></Icon>
                <span>You can select your equipment after submitting your studio hire request.</span>
              </AnimatedMessage>
            </div>

            <div className="field message">
              <textarea id="message" value={formData.message} onChange={(e) => updateField('message', e.target.value)} rows={4} placeholder=" " />
              <label htmlFor="message">Message (optional)</label>
            </div>

            <div className="flex flex-row gap-4 items-center justify-between mt-4">
              <button onClick={handleBack} className="link">
                <Icon name="icon-arrow" className="icon-arrow w-3 h-3 fill-black dark:fill-natural rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Back</title></Icon>
                <span>Back</span>
              </button>
              <button onClick={handleNext} className="btn self-end">
                <span>Next</span>
                <Icon name="icon-arrow" className="icon-arrow w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Next</title></Icon>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
            <div className={`col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-6 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

                <div className="text-lg flex flex-col gap-0.5">
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Name:</div><div className='grow'>{formData.name}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Business Type:</div><div className='grow'>{capitalizeFirst(formData.businessType)}</div></div>
                    {formData.companyName && <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Company:</div><div className='grow'>{formData.companyName}</div></div>}
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Email:</div><div className='grow'>{formData.email}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Phone:</div><div className='grow'>{formData.countryCode} {formData.phoneNumber}</div></div>
                </div>

                <div className="text-lg flex flex-col gap-0.5">
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Start Date:</div><div className='grow'>{formatDate(formData.hireStartDate)}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Days:</div><div className='grow'>{formData.days}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Times:</div><div className='grow'>{formData.arrivalTime} - {formData.leavingTime}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Type:</div><div className='grow'>{formatTypeOfBooking(formData.typeOfBooking)}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Attendees:</div><div className='grow'>{formData.attendees}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Hire Equipment:</div><div className='grow'>{formData.hireEquipment ? 'Yes' : 'No'}</div></div>
                </div>

                
                {formData.message && 
                  <div className="text-lg flex flex-row gap-0.5">
                    <div className='flex flex-col gap-2'><div className='text-black/60 dark:text-natural/60'>Message:</div><div className='max-h-40 overflow-scroll whitespace-pre-wrap'>{formData.message}</div></div>
                  </div>
                }

                <div className='flex flex-col gap-4 mt-4'>
                  <div className='field-wrapper'>
                    <label className='checkbox-simple'>
                      <input type='checkbox' checked={formData.agreeToTerms} onChange={(e) => updateField('agreeToTerms', e.target.checked)} />
                      <Icon name="icon-tick" className="icon-tick h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                      <span>Studio hire is subject to agreement with our <button type="button" className="underline" onClick={(e) => { e.preventDefault(); setIsTermsDrawerOpen(true); }}>Studio Hire Policy</button></span>
                    </label>
                    <AnimatedMessage show={!!errors.agreeToTerms} className="error">
                      <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                      <span id="agreeToTerms-error">{errors.agreeToTerms}</span>
                    </AnimatedMessage>
                  </div>

                  <label className='checkbox-simple'>
                    <input type='checkbox' checked={formData.subscribeToNewsletter} onChange={(e) => updateField('subscribeToNewsletter', e.target.checked)} />
                    <Icon name="icon-tick" className="icon-tick h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                    <span>Sign up to our newsletter to receive updates on our studio space.</span>
                  </label>
                </div>

                <div className="flex flex-row gap-4 items-center justify-between mt-4">
                    <button onClick={handleBack} className="link">
                        <Icon name="icon-arrow" className="icon-arrow w-3 h-3 fill-black dark:fill-natural rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Back</title></Icon>
                        <span>Back</span>
                    </button>
                    <button onClick={handleSubmit} className="btn self-end" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        )}

      </div>

    </div>
    
    {/* Terms Slide Panel */}
    {studio && global && (
      <SlidePanel isOpen={isTermsDrawerOpen} onClose={() => setIsTermsDrawerOpen(false)}>
        <StudioTerms onClose={() => setIsTermsDrawerOpen(false)} studio={studio} global={global} />
      </SlidePanel>
    )}
    </>
  )
}
