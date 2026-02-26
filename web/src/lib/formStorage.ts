const HIRE_STUDIO_KEY = 'pending_studio_hire'
const STORAGE_TTL = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

export interface HireStudioData {
  // Your Info
  name: string
  businessType: string
  companyName?: string
  email: string
  countryCode: string
  phoneNumber: string
  
  // Studio Enquiry
  hireStartDate: string
  days: number
  arrivalTime: string
  leavingTime: string
  typeOfBooking: string
  attendees: number
  hireEquipment: boolean
  message: string
  
  // Metadata
  timestamp: number
}

interface StoredFormData {
  data: HireStudioData
  timestamp: number
}

/**
 * Save Hire Studio form data to localStorage after submission
 * Used to pre-fill Equipment Hire form when user navigates from Studio → Equipment
 */
export function saveHireStudioData(data: Omit<HireStudioData, 'timestamp'>): void {
  if (typeof window === 'undefined') return

  try {
    const stored: StoredFormData = {
      data: {
        ...data,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    }
    localStorage.setItem(HIRE_STUDIO_KEY, JSON.stringify(stored))
  } catch (error) {
    console.error('Failed to save form data to localStorage:', error)
  }
}

/**
 * Get stored Hire Studio data if available and not expired
 * Returns null if no data or data is expired
 */
export function getHireStudioData(): HireStudioData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(HIRE_STUDIO_KEY)
    if (!stored) return null

    const parsed: StoredFormData = JSON.parse(stored)
    const now = Date.now()

    // Check if data is still valid (within TTL)
    if (now - parsed.timestamp < STORAGE_TTL) {
      return parsed.data
    } else {
      // Clear expired data
      localStorage.removeItem(HIRE_STUDIO_KEY)
      return null
    }
  } catch (error) {
    console.error('Failed to load form data from localStorage:', error)
    return null
  }
}

/**
 * Clear stored Hire Studio data
 * Call this after successful Equipment Hire form submission
 */
export function clearHireStudioData(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(HIRE_STUDIO_KEY)
  } catch (error) {
    console.error('Failed to clear form data from localStorage:', error)
  }
}

/**
 * Check if there's pending studio hire data
 * Useful for showing UI indicators
 */
export function hasPendingStudioHire(): boolean {
  return getHireStudioData() !== null
}
