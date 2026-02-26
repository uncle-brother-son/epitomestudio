'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { EquipmentItem } from '@/queries/equipment'

interface CartContextType {
  quantities: Record<string, number>
  items: EquipmentItem[]
  updateQuantity: (itemId: string, quantity: number) => void
  setItems: (items: EquipmentItem[]) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getCartSummary: () => Array<{ item: EquipmentItem; quantity: number }>
}

const EquipmentCartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'equipment_cart'
const STORAGE_TTL = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

interface StoredCart {
  quantities: Record<string, number>
  addOrder: string[]
  timestamp: number
}

export function EquipmentCartProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addOrder, setAddOrder] = useState<string[]>([])
  const [items, setItems] = useState<EquipmentItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: StoredCart = JSON.parse(stored)
        const now = Date.now()
        
        // Check if data is still valid (within TTL)
        if (now - parsed.timestamp < STORAGE_TTL) {
          setQuantities(parsed.quantities)
          setAddOrder(parsed.addOrder || [])
        } else {
          // Clear expired data
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
    
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever quantities change (client-side only)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return

    try {
      const data: StoredCart = {
        quantities,
        addOrder,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [quantities, addOrder, isHydrated])

  const updateQuantity = (itemId: string, quantity: number) => {
    setQuantities(prev => {
      const wasInCart = prev[itemId] > 0
      const willBeInCart = quantity > 0
      
      // Track order of addition
      if (!wasInCart && willBeInCart) {
        setAddOrder(order => [...order, itemId])
      } else if (wasInCart && !willBeInCart) {
        setAddOrder(order => order.filter(id => id !== itemId))
      }
      
      if (quantity === 0) {
        // Remove item if quantity is 0
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [itemId]: quantity
      }
    })
  }

  const clearCart = () => {
    setQuantities({})
    setAddOrder([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((sum, item) => {
      const qty = quantities[item._id] || 0
      return sum + (item.price * qty)
    }, 0)
  }

  const getCartSummary = () => {
    const itemsWithQuantity = items
      .filter(item => quantities[item._id] > 0)
      .map(item => ({
        item,
        quantity: quantities[item._id]
      }))
    
    // Sort by the order they were added
    return itemsWithQuantity.sort((a, b) => {
      const indexA = addOrder.indexOf(a.item._id)
      const indexB = addOrder.indexOf(b.item._id)
      return indexA - indexB
    })
  }

  return (
    <EquipmentCartContext.Provider
      value={{
        quantities,
        items,
        updateQuantity,
        setItems,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getCartSummary
      }}
    >
      {children}
    </EquipmentCartContext.Provider>
  )
}

export function useEquipmentCart() {
  const context = useContext(EquipmentCartContext)
  if (context === undefined) {
    throw new Error('useEquipmentCart must be used within EquipmentCartProvider')
  }
  return context
}
