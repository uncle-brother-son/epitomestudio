'use client'

import { useState } from 'react'
import { saveHireStudioData } from '@/lib/formStorage'
import { Icon } from './Icons'
import { AnimatedMessage } from './AnimatedMessage'
import { COUNTRY_CODES } from '@/lib/constants'

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
}

interface Props {
  onClose: () => void
}

export function HireStudioForm({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
    message: ''
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
    <div className="grid_ py-4 gap-y-6">
        <div className="col-start-1 col-span-full flex justify-end">
          <button onClick={onClose} className="close">
            <span>Close</span><Icon name="icon-close" className="w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
          </button>
        </div>

        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-4 mt-11">
            <p>Thank you.</p>
            <p>Your studio hire enquiry has been submitted.</p>
            <p>We'll be in touch soon.</p>
            
            {formData.hireEquipment && (
            <div className="flex flex-col gap-4">
                <p>You indicated you'd like to hire equipment.</p>
                <a href="/equipment-hire" className="btn self-start">Browse Equipment</a>
            </div>
            )}
            
            {!formData.hireEquipment && (
            <button onClick={onClose} className="btn self-start mt-4">
                <span>Done</span>
            </button>
            )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid_ py-4 gap-y-6">
      
        <div className="col-start-1 col-span-full flex justify-end">
          <button onClick={onClose} className="close">
            <span>Close</span><Icon name="icon-close" className="w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
          </button>
        </div>

        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 mt-11 flex flex-row gap-2 justify-start items-center">
          <button onClick={() => setCurrentStep(1)} className={`label transition-opacity duration-md ease-es ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'} ${currentStep > 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`} >Your Info</button>
          <Icon name="icon-chevron" className="w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Arrow Right</title></Icon>
          <button onClick={() => currentStep > 2 && setCurrentStep(2)} className={`label transition-opacity duration-md ease-es ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'} ${currentStep > 2 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>Studio Enquiry</button>
          <Icon name="icon-chevron" className="w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Arrow Right</title></Icon>
          <button className={`label transition-opacity duration-md ease-es ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'} cursor-default`}>Review</button> 
        </div>

        {/* Step 1: Your Info */}
        {currentStep === 1 && (
          <div className={`col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-2 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          
            <div className='field-wrapper'>
              <div className="field">
                <input type="text" id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                <label htmlFor="name">Name</label>
              </div>
              <AnimatedMessage show={!!errors.name} className="flex items-center gap-2 error">
                <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
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
                <Icon name="icon-chevron" className="h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <AnimatedMessage show={!!errors.businessType} className="flex items-center gap-2 error">
                <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="businessType-error">{errors.businessType}</span>
              </AnimatedMessage>
            </div>

            {formData.businessType === 'company' && (
              <>
                <div className='field-wrapper'>
                  <div className="field">
                    <input type="text" id="companyName" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} placeholder="" aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? "companyName-error" : undefined} />
                    <label htmlFor="companyName">Company Name</label>
                  </div>
                  <AnimatedMessage show={!!errors.companyName} className="flex items-center gap-2 error">
                    <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                    <span id="companyName-error">{errors.companyName}</span>
                  </AnimatedMessage>
                </div>
              </>
            )}

            <div className='field-wrapper'>
              <div className="field">
                <input type="email" id="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                <label htmlFor="email">Email</label>
              </div>
              <AnimatedMessage show={!!errors.email} className="flex items-center gap-2 error">
                <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="email-error">{errors.email}</span>
              </AnimatedMessage>
            </div>

            <div className="flex flex-row gap-2">
              <div className="field flex-1">
                <select id="countryCode" value={formData.countryCode} onChange={(e) => updateField('countryCode', e.target.value)}>
                  {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                      {item.code}
                  </option>
                  ))}
                </select>
                <label htmlFor="countryCode">Country</label>
                <Icon name="icon-chevron" className="h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <div className="field grow">
                <input type="tel" id="phoneNumber" value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} placeholder="" />
                <label htmlFor="phoneNumber">Phone Number</label>
              </div>
            </div>

            <button onClick={handleNext} className="btn self-end mt-4">
              <span>Next</span>
              <Icon name="icon-arrow" className="w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Next</title></Icon>
            </button>
          </div>
        )}

        {/* Step 2: Studio Enquiry */}
        {currentStep === 2 && (
          <div className={`col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-2 justify-start transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

            <div className='field-wrapper'>
              <div className="flex flex-row gap-2">
                <div className="basis-1/2 field">
                  <input type="date" id="hireStartDate" value={formData.hireStartDate} onChange={(e) => updateField('hireStartDate', e.target.value)} min={today} placeholder="" aria-invalid={!!errors.hireStartDate} aria-describedby={errors.hireStartDate ? "hireStartDate-error" : undefined} />
                  <label htmlFor="hireStartDate">Hire Start Date</label>
                  <Icon name="icon-date" className="h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Date Picker</title></Icon>
                </div>
                <div className="basis-1/2 flex flex-row items-center justify-between bg-black/5 dark:bg-natural/5 rounded px-4 py-3.5">
                  <label className="text-lg leading-4 opacity-60">Days</label>
                  <div className="flex flex-row gap-1.5 items-center">
                    <button type="button" className={`qty ${formData.days === 1 ? 'opacity-60' : ''}`} onClick={() => updateField('days', Math.max(1, formData.days - 1))}>
                      <Icon name="icon-minus" className="w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease</title></Icon>
                    </button>
                    <span className="text-lg leading-4 w-4 text-center">{formData.days}</span>
                    <button type="button" className="qty" onClick={() => updateField('days', formData.days + 1)}>
                      <Icon name="icon-plus" className="w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Increase</title></Icon>
                    </button>
                  </div>
                </div>
              </div>
              <AnimatedMessage show={!!errors.hireStartDate} className="flex items-center gap-2 error">
                <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="hireStartDate-error">{errors.hireStartDate}</span>
              </AnimatedMessage>
            </div>

            <div className="flex flex-row gap-2">
              <div className="field grow">
                <input type="time" id="arrivalTime" value={formData.arrivalTime} onChange={(e) => updateField('arrivalTime', e.target.value)} placeholder='' />
                <label htmlFor="arrivalTime">Arrival Time</label>
                <Icon name="icon-time" className="h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Time Picker</title></Icon>
              </div>
              <div className="field grow">
                <input type="time" id="leavingTime" value={formData.leavingTime} onChange={(e) => updateField('leavingTime', e.target.value)} placeholder='' />
                <label htmlFor="leavingTime">Leaving Time</label>
                <Icon name="icon-time" className="h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Time Picker</title></Icon>
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
                <Icon name="icon-chevron" className="h-4 w-4 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <AnimatedMessage show={!!errors.typeOfBooking} className="flex items-center gap-2 error">
                <Icon name="icon-subArrow" className="h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="typeOfBooking-error">{errors.typeOfBooking}</span>
              </AnimatedMessage>
            </div>

            <div className="flex flex-row items-center justify-between bg-black/5 dark:bg-natural/5 rounded px-4 py-3.5">
              <label className="text-lg leading-4 opacity-60">Attendees</label>
              <div className="flex flex-row gap-1.5 items-center">
                <button type="button" className={`qty ${formData.attendees === 10 ? 'opacity-60' : ''}`} onClick={() => updateField('attendees', Math.max(10, formData.attendees - 10))}>
                  <Icon name="icon-minus" className="w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease</title></Icon>
                </button>
                <span className="text-lg leading-4 w-4 text-center">{formData.attendees}</span>
                <button type="button" className={`qty ${formData.attendees === 30 ? 'opacity-60' : ''}`} onClick={() => updateField('attendees', Math.min(30, formData.attendees + 10))}>
                  <Icon name="icon-plus" className="w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Increase</title></Icon>
                </button>
              </div>
            </div>

            <div className='field-wrapper'>
              <div className="field">
                <input type="checkbox" id="hireEquipment" checked={formData.hireEquipment} onChange={(e) => updateField('hireEquipment', e.target.checked)} className="sr-only" />
                <label htmlFor="hireEquipment" className="flex flex-row items-center justify-between cursor-pointer text-lg static bg-black/5 dark:bg-natural/5 rounded px-4 py-3">
                  <div>Hire Equipment</div>
                  <div className='flex flex-row gap-2 items-center justify-center'>
                    <div className='text-black dark:text-natural'>{formData.hireEquipment ? 'Yes' : 'No'}</div>
                    <div className='h-6 w-12 rounded bg-black/5 dark:bg-natural/5 relative'>
                      <div className={`h-5 w-5 rounded absolute top-0.5 transition-all duration-md ease-es ${formData.hireEquipment ? 'left-6.5 bg-green' : 'left-0.5 bg-red'}`} />
                    </div>
                  </div>
                </label>
              </div>
              <AnimatedMessage show={formData.hireEquipment} className="flex items-center gap-2 note">
                <Icon name="icon-subArrow" className="h-3 w-3 fill-black/60 dark:fill-natural/60 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Hire Equipment note</title></Icon>
                <span>You can select your equipment after submitting your studio hire request.</span>
              </AnimatedMessage>
            </div>

            <div className="field">
              <textarea id="message" value={formData.message} onChange={(e) => updateField('message', e.target.value)} rows={4} placeholder='' />
              <label htmlFor="message">Message (optional)</label>
            </div>

            <div className="flex flex-row gap-4 items-center justify-between mt-4">
              <button onClick={handleBack} className="link">
                <Icon name="icon-arrow" className="w-3 h-3 fill-black dark:fill-natural rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Back</title></Icon>
                <span>Back</span>
              </button>
              <button onClick={handleNext} className="btn self-end">
                <span>Next</span>
                <Icon name="icon-arrow" className="w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Next</title></Icon>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
            <div className={`col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-6 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

                <div className="text-lg flex flex-col gap-0.5">
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Name:</div><div>{formData.name}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Business Type:</div><div>{capitalizeFirst(formData.businessType)}</div></div>
                    {formData.companyName && <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Company:</div><div>{formData.companyName}</div></div>}
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Email:</div><div>{formData.email}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Phone:</div><div>{formData.countryCode} {formData.phoneNumber}</div></div>
                </div>

                <div className="text-lg flex flex-col gap-0.5">
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Start Date:</div><div>{formatDate(formData.hireStartDate)}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Days:</div><div>{formData.days}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Times:</div><div>{formData.arrivalTime} - {formData.leavingTime}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Type:</div><div>{formatTypeOfBooking(formData.typeOfBooking)}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Attendees:</div><div>{formData.attendees}</div></div>
                    <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Hire Equipment:</div><div>{formData.hireEquipment ? 'Yes' : 'No'}</div></div>
                </div>

                <div className="text-lg flex flex-col gap-0.5">
                    {formData.message && <div className='flex flex-col gap-2'><div className='text-black/60 dark:text-natural/60'>Message:</div><div className='max-h-40 overflow-scroll'>{formData.message}</div></div>}
                </div>

                <div className="flex flex-row gap-4 items-center justify-between mt-4">
                    <button onClick={handleBack} className="link">
                        <Icon name="icon-arrow" className="w-3 h-3 fill-black dark:fill-natural rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Back</title></Icon>
                        <span>Back</span>
                    </button>
                    <button onClick={handleSubmit} className="btn self-end" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Hire Request'}
                    </button>
                </div>
            </div>
        )}
    </div>
  )
}
