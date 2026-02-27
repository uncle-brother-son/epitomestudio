'use client'

import { useState, useEffect } from 'react'
import { getHireStudioData, clearHireStudioData } from '@/lib/formStorage'
import { useEquipmentCart } from '@/contexts/EquipmentCartContext'
import { Icon } from './Icons'
import { AnimatedMessage } from './AnimatedMessage'
import { COUNTRY_CODES } from '@/lib/constants'
import { SlidePanel } from './SlidePanel'
import { EquipmentTerms } from './EquipmentTerms'
import type { Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface FormData {
  // Step 1: Your Info
  name: string
  businessType: string
  companyName: string
  email: string
  countryCode: string
  phoneNumber: string
  
  // Step 2: Equipment Enquiry
  hireStartDate: string
  days: number
  pickUpTime: string
  dropOffTime: string
  hireStudio: boolean
  message: string
  
  // Equipment items (managed separately)
  items: CartItem[]
  
  // Checkboxes
  agreeToTerms: boolean
  subscribeToNewsletter: boolean
}

interface Props {
  onClose: () => void
  equipment?: Equipment | null
  global?: Global | null
}

export function EquipmentHireForm({ onClose, equipment, global }: Props) {
  const { getCartSummary, clearCart } = useEquipmentCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showPriceInfo, setShowPriceInfo] = useState(false)
  const [isTermsDrawerOpen, setIsTermsDrawerOpen] = useState(false)
  const [hasStudioData, setHasStudioData] = useState(false)
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
    pickUpTime: '09:00',
    dropOffTime: '18:00',
    hireStudio: false,
    message: '',
    items: [],
    agreeToTerms: false,
    subscribeToNewsletter: false
  })

  const today = new Date().toISOString().split('T')[0]

  // Pre-fill from localStorage if coming from Hire Studio
  useEffect(() => {
    const studioData = getHireStudioData()
    if (studioData) {
      setHasStudioData(true)
      setCurrentStep(3) // Skip to review step since we have their info
      setFormData(prev => ({
        ...prev,
        name: studioData.name,
        businessType: studioData.businessType,
        companyName: studioData.companyName || '',
        email: studioData.email,
        countryCode: studioData.countryCode,
        phoneNumber: studioData.phoneNumber,
        hireStartDate: studioData.hireStartDate,
        days: studioData.days,
        pickUpTime: studioData.arrivalTime,
        dropOffTime: studioData.leavingTime,
        hireStudio: true, // Auto-set to Yes since they came from Studio Hire
      }))
    }
    
    // Load selected equipment items from cart
    const cartSummary = getCartSummary()
    if (cartSummary.length > 0) {
      const cartItems: CartItem[] = cartSummary.map(summary => ({
        id: summary.item._id,
        name: `${summary.item.brand} ${summary.item.name}`,
        quantity: summary.quantity,
        price: summary.item.price
      }))
      setFormData(prev => ({ ...prev, items: cartItems }))
    }
  }, [getCartSummary])

  // Close price info when clicking outside
  useEffect(() => {
    if (!showPriceInfo) return

    const handleClickOutside = () => {
      setShowPriceInfo(false)
    }

    // Small delay to prevent immediate closing from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showPriceInfo])

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

  const calculateItemTotal = (item: CartItem) => {
    return item.price * item.quantity
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() * formData.days
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
      setErrors({ agreeToTerms: 'You must agree to the Equipment Hire Policy to continue' })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit to API
      const response = await fetch('/api/hire-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Submission failed')

      // Clear stored studio hire data after successful equipment hire
      clearHireStudioData()
      
      // Clear equipment cart after successful submission
      clearCart()

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
      <>
      <div className="grow flex flex-col p-4 pt-20">
      
        <button onClick={onClose} className="close absolute top-4 right-4">
          <span>Close</span><Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
        </button>

        <div className="grow grid_ gap-y-6 overflow-y-scroll lg:overflow-y-auto">
          <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-8 lg:col-span-10 flex flex-col gap-4 mt-11">
            <p>Thank you.</p>
            <p>Your equipment hire enquiry has been submitted.</p>
            <p>We'll be in touch soon.</p>
            
            <button onClick={onClose} className="btn self-start mt-4">
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Terms Slide Panel */}
      {equipment && global && (
        <SlidePanel isOpen={isTermsDrawerOpen} onClose={() => setIsTermsDrawerOpen(false)}>
          <EquipmentTerms onClose={() => setIsTermsDrawerOpen(false)} equipment={equipment} global={global} />
        </SlidePanel>
      )}
      </>
    )
  }

  return (
    <>
    <div className="grow flex flex-col gap-6 p-4 pt-20">
      
      <button onClick={onClose} className="close absolute top-4 right-4">
        <span>Close</span>
        <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Close</title></Icon>
      </button>
 
      <div className="grid_">
        <div className="col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-5 lg:col-span-10 mt-11 flex flex-row gap-2 justify-start items-center">
          <button onClick={() => setCurrentStep(1)} className={`label transition-opacity duration-md ease-es ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'} ${currentStep > 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>Your Info</button>
          <Icon name="icon-chevron" className="icon-chevron w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Arrow Right</title></Icon>
          <button onClick={() => currentStep > 2 && setCurrentStep(2)} className={`label transition-opacity duration-md ease-es ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'} ${currentStep > 2 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>Equipment Enquiry</button>
          <Icon name="icon-chevron" className="icon-chevron w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Arrow Right</title></Icon>
          <button className={`label transition-opacity duration-md ease-es ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'} cursor-default`}>Review</button> 
        </div>
      </div>

      <div className="grid_ gap-y-6">

        {/* Item Summary */}
        {formData.items.length > 0 && (
          <div className="row-start-1 col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-16 lg:col-span-5 flex flex-col gap-2">
            <div className="bg-black/5 dark:bg-natural/5 rounded flex flex-col overflow-hidden">
                <button onClick={() => setIsSummaryOpen(!isSummaryOpen)}className='flex flex-row justify-between w-full lg:cursor-default p-4' type="button">
                  <div className="label">Item Summary<span className='lg:hidden pl-2'>[ {formData.items.length} ]</span></div>
                  <Icon name="icon-chevron" className={`icon-chevron w-3 h-3 fill-black dark:fill-natural lg:hidden transition-transform duration-lg ease-es ${isSummaryOpen ? 'rotate-270' : 'rotate-90'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Toggle Summary</title></Icon>
                </button>
                
                <div className={`grid transition-all duration-lg lg:duration-0 ease-es lg:grid-rows-[1fr]! lg:opacity-100! px-4 lg:pb-4 lg:pt-2 ${isSummaryOpen ? 'pb-4 pt-2' : 'py-0'}`} style={{ gridTemplateRows: isSummaryOpen ? '1fr' : '0fr', opacity: isSummaryOpen ? 1 : 0 }}>
                  <div className="overflow-hidden">
                    <div className='flex flex-col gap-6'>
                      <div className='flex flex-col gap-0'>
                        {formData.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className='basis-4/6'>{item.name}</div>
                            <div className='basis-1/6 text-right'>&#120273; {item.quantity}</div>
                            <div className='basis-1/6 text-right'>£{item.price}</div> {/* calculateItemTotal(item) */}
                          </div>
                        ))}
                      </div>
                      <div className='flex flex-col gap-0'>
                        <div className="flex justify-between">
                            <span>Total Per Day</span>
                            <span>£{calculateSubtotal()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Days</span>
                            <span>&#120273; {formData.days}</span>
                        </div>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <div className="flex justify-between font-medium text-lg">
                          <div className="flex flex-row gap-2 justify-start items-center">
                            <span>Total (excl. VAT)</span>
                            <button
                              type="button"
                              className="group relative"
                              onMouseEnter={() => setShowPriceInfo(true)}
                              onMouseLeave={() => setShowPriceInfo(false)}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowPriceInfo(!showPriceInfo)
                              }}
                            >
                              <Icon name="icon-info" className="icon-info w-4 h-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Info</title></Icon>
                            </button>
                          </div>
                          <span className="text-black dark:text-natural">£{calculateTotal()}</span>
                        </div>
                        <AnimatedMessage show={showPriceInfo} className="flex items-start gap-2 text-xs text-black/60 dark:text-natural/60 px-2">
                          <Icon name="icon-subArrow" className="icon-subArrow w-3 h-3 fill-black/60 dark:fill-natural/60 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Note</title></Icon>
                          <span>Total Price does not include insurance or a damage waiver fee.</span>
                        </AnimatedMessage>
                      </div>

                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Step 1: Your Info */}
        {currentStep === 1 && (
          <div className={`row-start-2 lg:row-start-1 col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-5 lg:col-span-10 flex flex-col gap-2 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          
            <div className='field-wrapper'>
              <div className="field">
                <input type="text" id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
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
              <div className='field-wrapper'>
                <div className="field">
                  <input type="text" id="companyName" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} placeholder="" aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? "companyName-error" : undefined} />
                  <label htmlFor="companyName">Company Name</label>
                </div>
              <AnimatedMessage show={!!errors.companyName} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="companyName-error">{errors.companyName}</span>
              </AnimatedMessage>
              </div>
            )}

            <div className='field-wrapper'>
              <div className="field">
                <input type="email" id="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                <label htmlFor="email">Email</label>
              </div>
              <AnimatedMessage show={!!errors.email} className="error">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                <span id="email-error">{errors.email}</span>
              </AnimatedMessage>
            </div>

            <div className="field-row">
              <div className="field flex-2">
                <select id="countryCode" value={formData.countryCode} onChange={(e) => updateField('countryCode', e.target.value)}>
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code}
                    </option>
                  ))}
                </select>
                <label htmlFor="countryCode">Country</label>
                <Icon name="icon-chevron" className="icon-chevron h-3 w-3 fill-black dark:fill-natural rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Dropdown</title></Icon>
              </div>
              <div className="field flex-8">
                <input type="tel" id="phoneNumber" value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} placeholder="" />
                <label htmlFor="phoneNumber">Phone Number</label>
              </div>
            </div>

            <button onClick={handleNext} className="btn self-end mt-4">
              <span>Next</span>
              <Icon name="icon-arrow" className="icon-arrow w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Next</title></Icon>
            </button>
          </div>
        )}

        {/* Step 2: Equipment Enquiry */}
        {currentStep === 2 && (
          <div className={`row-start-2 lg:row-start-1 col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-5 lg:col-span-10 flex flex-col gap-2 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

            <div className='field-wrapper'>
              <div className="field-row">
                <div className="basis-1/2 field">
                  <input type="date" id="hireStartDate" value={formData.hireStartDate} onChange={(e) => updateField('hireStartDate', e.target.value)} min={today} placeholder="" aria-invalid={!!errors.hireStartDate} aria-describedby={errors.hireStartDate ? "hireStartDate-error" : undefined} />
                    <label htmlFor="hireStartDate">Hire Start Date</label>
                    <Icon name="icon-date" className="icon-date h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Date Picker</title></Icon>
                  </div>
                <div className="basis-1/2 flex flex-row items-center justify-between bg-black/5 dark:bg-natural/5 rounded px-4 py-3.5">
                  <label className="text-lg leading-4 opacity-60">Days</label>
                  <div className="flex flex-row gap-1.5 items-center">
                    <button type="button" className={`qty-form ${formData.days === 1 ? 'opacity-60' : ''}`} onClick={() => updateField('days', Math.max(1, formData.days - 1))}>
                      <Icon name="icon-minus" className="icon-minus w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease</title></Icon>
                    </button>
                    <span className="text-lg leading-4 w-4 text-center">{formData.days}</span>
                    <button type="button" className={`qty-form ${formData.days === 1 ? 'opacity-60' : ''}`} onClick={() => updateField('days', formData.days + 1)}>
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
              <div className="field basis-1/2">
                <input type="time" id="pickUpTime" value={formData.pickUpTime} onChange={(e) => updateField('pickUpTime', e.target.value)} step="900" />
                <label htmlFor="pickUpTime">Pick Up Time</label>
                <Icon name="icon-time" className="icon-time h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Time Picker</title></Icon>
              </div>
              <div className="field basis-1/2">
                <input type="time" id="dropOffTime" value={formData.dropOffTime} onChange={(e) => updateField('dropOffTime', e.target.value)} step="900" />
                <label htmlFor="dropOffTime">Drop Off Time</label>
                <Icon name="icon-time" className="icon-time h-4 w-4 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Time Picker</title></Icon>
              </div>
            </div>

            <div className='field-wrapper'>
              <div className="field">
                <input type="checkbox" id="hireStudio" checked={formData.hireStudio} onChange={(e) => updateField('hireStudio', e.target.checked)} className="sr-only" />
                <label htmlFor="hireStudio" className="flex flex-row items-center justify-between cursor-pointer text-lg static bg-black/5 dark:bg-natural/5 rounded px-4 py-3">
                  <div>Hire Studio</div>
                  <div className='flex flex-row gap-4 items-center justify-center'>
                    <div className='text-black dark:text-natural'>{formData.hireStudio ? 'Yes' : 'No'}</div>
                    <div className='h-6 w-12 rounded bg-black/5 dark:bg-natural/5 relative'>
                      <div className={`h-5 w-5 rounded absolute top-0.5 transition-all duration-md ease-es ${formData.hireStudio ? 'left-6.5 bg-green' : 'left-0.5 bg-red'}`} />
                    </div>
                  </div>
                </label>
              </div>
              <AnimatedMessage show={formData.hireStudio} className="note">
                <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-black dark:fill-natural mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Hire Studio note</title></Icon>
                <span>We'll contact you about studio availability for your equipment hire dates.</span>
              </AnimatedMessage>
            </div>

            <div className="field">
              <textarea id="message" value={formData.message} onChange={(e) => updateField('message', e.target.value)} rows={4} placeholder='' />
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
          <div className={`row-start-2 lg:row-start-1 col-start-1 col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-5 lg:col-span-10 flex flex-col gap-6 transition-opacity duration-md ease-es ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

            <div className="text-lg flex flex-col gap-0.5">
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Name:</div><div className='grow'>{formData.name}</div></div>
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Business Type:</div><div className='grow'>{capitalizeFirst(formData.businessType)}</div></div>
              {formData.companyName && <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Company:</div><div className='grow'>{formData.companyName}</div></div>}
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Email:</div><div className='grow'>{formData.email}</div></div>
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Phone:</div><div className='grow'>{formData.countryCode} {formData.phoneNumber}</div></div>
            </div>

            <div className="text-lg flex flex-col gap-0.5">
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Start Date:</div><div className='grow'>{formatDate(formData.hireStartDate)}</div></div>
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Days:</div><div className='grow'>&#120273; {formData.days}</div></div>
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Times:</div><div className='grow'>{formData.pickUpTime} - {formData.dropOffTime}</div></div>
              <div className='flex gap-2'><div className='cd4 text-black/60 dark:text-natural/60'>Hire Studio:</div><div className='grow'>{formData.hireStudio ? 'Yes' : 'No'}</div></div>
            </div>

            
            {formData.message && 
              <div className="text-lg flex flex-col gap-0.5">
                <div className='flex flex-col gap-2'><div className='text-black/60 dark:text-natural/60'>Message:</div><div className='max-h-40 overflow-scroll whitespace-pre-wrap'>{formData.message}</div></div>
              </div>
            }

            <div className='flex flex-col gap-4 mt-4'>
              <div className='field-wrapper'>
                <label className='checkbox-simple'>
                  <input type='checkbox' checked={formData.agreeToTerms} onChange={(e) => updateField('agreeToTerms', e.target.checked)} />
                  <Icon name="icon-tick" className="icon-tick h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                  <span>Equipment hire is subject to agreement with our <button type="button" className="underline" onClick={(e) => { e.preventDefault(); setIsTermsDrawerOpen(true); }}>Equipment Hire Policy</button></span>
                </label>              
                <AnimatedMessage show={!!errors.agreeToTerms} className="error">
                  <Icon name="icon-subArrow" className="icon-subArrow h-3 w-3 fill-red mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Error note</title></Icon>
                  <span id="agreeToTerms-error">{errors.agreeToTerms}</span>
                </AnimatedMessage>
              </div>

              <label className='checkbox-simple'>
                <input type='checkbox' checked={formData.subscribeToNewsletter} onChange={(e) => updateField('subscribeToNewsletter', e.target.checked)} />
                <Icon name="icon-tick" className="icon-tick h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                <span>Sign up to our newsletter to receive updates on new equipment.</span>
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
    {equipment && global && (
      <SlidePanel isOpen={isTermsDrawerOpen} onClose={() => setIsTermsDrawerOpen(false)}>
        <EquipmentTerms onClose={() => setIsTermsDrawerOpen(false)} equipment={equipment} global={global} />
      </SlidePanel>
    )}
    </>
  )
}
