'use client'

import { useState, useEffect } from 'react'
import { EquipmentItemCard } from './EquipmentItemCard'
import { Icon } from './Icons'
import { EquipmentHireButton } from './EquipmentHireButton'
import { EquipmentTermsButton } from './EquipmentTermsButton'
import type { EquipmentItem, Category, Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'
import { useEquipmentCart } from '@/contexts/EquipmentCartContext'
import { Reveal } from '@/components/Reveal'

interface Props {
  categories: Category[]
  items: EquipmentItem[]
  equipmentListUrl?: string
  equipmentListButtonLabel?: string
  equipment: Equipment | null
  global: Global | null
}

export function EquipmentFilterAndList({ categories, items, equipmentListUrl, equipmentListButtonLabel, equipment, global }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'image' | 'list'>('image')
  const { quantities, updateQuantity, getTotalItems, getTotalPrice, setItems } = useEquipmentCart()

  // Set items in context when component mounts or items change
  useEffect(() => {
    setItems(items)
  }, [items, setItems])

  // Get parent categories (those without a parent)
  const parentCategories = categories.filter(cat => !cat.parent)

  // Get child categories for a specific parent
  const getChildren = (parentId: string) => {
    return categories.filter(cat => cat.parent?._id === parentId)
  }

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Unchecking - remove category and all its children
        const children = getChildren(categoryId)
        const childIds = children.map(child => child._id)
        return prev.filter(id => id !== categoryId && !childIds.includes(id))
      } else {
        // Checking - add category
        return [...prev, categoryId]
      }
    })
  }

  // Filter items based on selected categories and search query
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery) {
      // Split query into words and check if all words match
      const queryWords = searchQuery.toLowerCase().trim().split(/\s+/)
      const searchableText = [
        item.name?.toLowerCase() || '',
        item.brand?.toLowerCase() || '',
        item.category?.name?.toLowerCase() || ''
      ].join(' ')
      
      // All query words must appear somewhere in the combined text
      const allWordsMatch = queryWords.every(word => searchableText.includes(word))
      
      if (!allWordsMatch) return false
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      if (!item.category) return false
      
      // Check if item's category is directly selected
      if (selectedCategories.includes(item.category._id)) return true
      
      // Check if item's parent category is selected
      // BUT only if no children of that parent are selected
      if (item.category.parent && selectedCategories.includes(item.category.parent._id)) {
        const parentChildren = getChildren(item.category.parent._id)
        const hasSelectedChildren = parentChildren.some(child => selectedCategories.includes(child._id))
        
        // Only show if no specific children are selected
        if (!hasSelectedChildren) return true
      }
      
      return false
    }
    
    return true
  })

  // Get count of unique items in cart for a category
  const getCategoryCartCount = (categoryId: string, includeChildren: boolean = false): number => {
    const categoryItemIds = items
      .filter(item => {
        if (!item.category) return false
        
        // Direct match
        if (item.category._id === categoryId) return true
        
        // Include children if requested (for parent categories)
        if (includeChildren) {
          if (item.category.parent?._id === categoryId) return true
        }
        
        return false
      })
      .filter(item => quantities[item._id] > 0) // Only items in cart
      .map(item => item._id)
    
    return categoryItemIds.length
  }

  // Get totals from context
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <>
      <div className='col-start-1 col-span-12 lg:col-start-1 lg:col-span-5 flex flex-col gap-8'>
        <div className='flex flex-row items-center justify-between'>
          <div className='label pl-4'>{filteredItems.length} / {items.length} Items</div>
          <button className='relative hover:bg-black/5 dark:hover:bg-natural/5 p-0.5 rounded flex flex-row gap-1 items-center justify-start duration-md ease-es group' onClick={() => setViewMode(viewMode === 'image' ? 'list' : 'image')}>
            <div className='z-10 py-1 px-4'>
              <Icon name="icon-image" className={`icon-image w-3 h-3 ${viewMode === 'image' ? 'fill-black dark:fill-natural' : 'fill-black/40 dark:fill-natural/40'} duration-md ease-es`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><title>Image View</title></Icon>
            </div>
            <div className='z-10 py-1 px-4'>
              <Icon name="icon-list" className={`icon-list w-3 h-3 ${viewMode === 'list' ? 'fill-black dark:fill-natural' : 'fill-black/40 dark:fill-natural/40'} duration-md ease-es`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><title>List View</title></Icon>
            </div>
            <div className={`absolute top-0.5 ${viewMode === 'image' ? 'left-0.5' : 'left-12.5'} h-5 w-11 bg-natural dark:bg-black rounded transition-all duration-md ease-es`} />
          </button>
        </div>

        <div className='field search'>
          <Icon name="icon-search" className="icon-search w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Search</title></Icon>
          <input type='text' placeholder='Search' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label='Clear search'>
              <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Clear search</title></Icon>
            </button>
          )}
        </div>

        <ul className='flex flex-col'>
          {parentCategories.map((parent, index) => {
            const children = getChildren(parent._id)
            const isSelected = selectedCategories.includes(parent._id)
            const parentCount = getCategoryCartCount(parent._id, true)

            return (
              <Reveal index={index} key={parent._id} className='flex flex-col'>
                <label className='checkbox grow px-4 py-2 rounded flex flex-row items-center justify-start gap-2 duration-md ease-es cursor-pointer'>
                  <input type='checkbox' checked={isSelected} onChange={() => toggleCategory(parent._id)} />
                  <Icon name="icon-tick" className="icon-tick h-4 w-4 transition-opacity duration-md ease-es" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                  <span className='grow'>{parent.name}{parentCount > 0 && ` (${parentCount})`}</span>
                </label>

                {isSelected && children.length > 0 && (
                  <ul className='flex flex-col pl-4'>
                    {children.map((child, childIndex) => {
                      const isChildSelected = selectedCategories.includes(child._id)
                      const childCount = getCategoryCartCount(child._id, false)
                      
                      return (
                        <Reveal index={childIndex} key={child._id} className='flex flex-col'>
                          <label className='checkbox grow px-4 py-2 rounded flex flex-row items-center justify-start gap-2 duration-md ease-es cursor-pointer'>
                            <input type='checkbox' checked={isChildSelected} onChange={() => toggleCategory(child._id)} />
                            <Icon name="icon-tick" className="icon-tick h-4 w-4 transition-opacity duration-md ease-es" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                            <span>{child.name}{childCount > 0 && ` (${childCount})`}</span>
                          </label>
                        </Reveal>
                      )
                    })}
                  </ul>
                )}
              </Reveal>
            )
          })}
        </ul>

        {equipmentListUrl && (
          <div className='lg:sticky lg:bottom-20 lg:mt-auto self-start ml-4'> 
            <a href={equipmentListUrl} target="_blank" rel="noopener noreferrer" className="link line self-start">
              <span>{equipmentListButtonLabel || 'Download Equipment List'}</span>
              <Icon name="icon-download" className="icon-download fill-black dark:fill-natural h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Download</title></Icon>
            </a>
          </div>
        )}
        
      </div>

      <div className={`col-start-1 col-span-12 lg:col-start-7 lg:col-span-11 flex flex-col ${viewMode === 'list' ? 'gap-0' : 'gap-6'}`}>
        {filteredItems.map((item, index) => (
          <EquipmentItemCard 
            key={item._id} 
            item={item} 
            viewMode={viewMode}
            quantity={quantities[item._id] || 0}
            onQuantityChange={(qty) => updateQuantity(item._id, qty)}
            priority={index < 3}
          />
        ))}
      </div>

      <div className='col-start-1 col-span-12 lg:col-start-20 lg:col-span-5 flex flex-col gap-6'>
        <div className='bg-black/5 dark:bg-natural/5 rounded p-4 flex flex-col gap-4'>
            <div className='label'>Your List</div>
            <div className='flex flex-col gap-1'>
                <div className='flex flex-row gap-2 justify-between items-center'>
                    <div>Items</div>
                    <div>{totalItems}</div>
                </div>
                <div className='flex flex-row gap-2 justify-between items-center'>
                    <div>Total Per Day (excl. VAT)</div>
                    <div>£{totalPrice}</div>
                </div>
            </div>
            <EquipmentHireButton label="Hire Equipment" className="btn justify-center" equipment={equipment} global={global} />
        </div>
      </div>
    </>
  )
}
