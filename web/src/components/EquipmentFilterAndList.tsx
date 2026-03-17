'use client'

import { useState, useEffect, useRef } from 'react'
import { EquipmentItemCard } from './EquipmentItemCard'
import { Icon } from './Icons'
import { EquipmentHireButton } from './EquipmentHireButton'
import { EquipmentTermsButton } from './EquipmentTermsButton'
import type { EquipmentItem, Category, Equipment } from '@/queries/equipment'
import type { Global } from '@/queries/global'
import { useEquipmentCart } from '@/contexts/EquipmentCartContext'
import { StickyContent } from '@/components/StickyContent'
import { HideOnFooter } from '@/components/HideOnFooter'


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
  const [displayedViewMode, setDisplayedViewMode] = useState<'image' | 'list'>('image')
  const [visibleCount, setVisibleCount] = useState(50)
  const [previousVisibleCount, setPreviousVisibleCount] = useState(50)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'fadeOut' | 'fadeIn'>('idle')
  const [displayedItems, setDisplayedItems] = useState<EquipmentItem[]>(items)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  // Handle filter/search changes with animations
  useEffect(() => {
    // Skip animation on initial mount
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    setIsAnimating(true)
    setAnimationPhase('fadeOut')
    
    // Wait for fade out to complete, then update items and fade in
    setTimeout(() => {
      setDisplayedItems(filteredItems)
      setVisibleCount(50) // Reset to initial count
      setPreviousVisibleCount(0) // Reset to 0 so all items animate in
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      setAnimationPhase('fadeIn')
      
      // Wait for fade in to complete
      setTimeout(() => {
        setIsAnimating(false)
        setAnimationPhase('idle')
        setPreviousVisibleCount(50) // Update to current count after animation
      }, 960)
    }, 480)
  }, [selectedCategories, searchQuery])

  // Handle viewMode changes with animations (no item swap)
  useEffect(() => {
    // Skip animation on initial mount  
    if (!isInitialized) {
      return
    }

    setIsAnimating(true)
    setAnimationPhase('fadeOut')
    
    // Wait for fade out to complete, then update view mode and fade in
    setTimeout(() => {
      setDisplayedViewMode(viewMode)
      setPreviousVisibleCount(0) // Reset to 0 so all visible items animate in
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      setAnimationPhase('fadeIn')
      
      // Wait for fade in to complete
      setTimeout(() => {
        setIsAnimating(false)
        setAnimationPhase('idle')
        setPreviousVisibleCount(visibleCount) // Update to current count after animation
      }, 960)
    }, 480)
  }, [viewMode])

  // Handle Load More with fade in animation
  const handleLoadMore = () => {
    const newCount = visibleCount + 50
    setPreviousVisibleCount(visibleCount)
    setVisibleCount(newCount)
    setAnimationPhase('fadeIn')
    
    // Calculate max animation duration for new items (50 items * 50ms = 2500ms base + 480ms fade)
    setTimeout(() => {
      setAnimationPhase('idle')
      setPreviousVisibleCount(newCount)
    }, 480 + (50 * 50))
  }

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
      <StickyContent mTop={-16} dTop={10} className="z-2 pt-20 lg:pt-0 -mt-20 lg:mt-0 bg-natural dark:bg-black lg:bg-transparent lg:dark:bg-transparent col-start-1 col-span-12 flex flex-row items-center justify-between sticky lg:left-4 lg:w-[calc(((100vw-216px)/4.8)+32px)] 2xl:left-[calc(((100vw-216px)/24)+24px)] transition-colors duration-lg ease-es">
        <div className='label pl-4'>{filteredItems.length} / {items.length} Items</div>
        <button className='group relative hover:bg-black/10 dark:hover:bg-natural/10 p-0.5 rounded flex flex-row gap-1 items-center justify-start duration-md ease-es group' onClick={() => setViewMode(viewMode === 'image' ? 'list' : 'image')}>
          <div className='z-1 py-1 px-4'>
            <Icon name="icon-image" className={`icon-image w-3 h-3 ${viewMode === 'image' ? 'fill-black dark:fill-natural' : 'fill-black/40 dark:fill-natural/40'} duration-md ease-es`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><title>Image View</title></Icon>
          </div>
          <div className='z-1 py-1 px-4'>
            <Icon name="icon-list" className={`icon-list w-3 h-3 ${viewMode === 'list' ? 'fill-black dark:fill-natural' : 'fill-black/40 dark:fill-natural/40'} duration-md ease-es`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><title>List View</title></Icon>
          </div>
          <div className={`absolute top-0.5 ${viewMode === 'image' ? 'left-0.5' : 'left-12.5'} h-5 w-11 group-hover:bg-natural dark:group-hover:bg-black rounded transition-all duration-md ease-es`} />
        </button>
      </StickyContent>

      <StickyContent mTop={10} className='z-1 py-4 lg:py-0 -my-4 lg:my-0 bg-natural dark:bg-black lg:bg-transparent lg:dark:bg-transparent col-start-1 col-span-12 lg:col-start-1 lg:col-span-5 2xl:col-start-2 2xl:col-span-5 flex flex-col sticky lg:static transition-colors duration-lg ease-es'>

        <StickyContent dTop={25.5} className="flex flex-row gap-2 items-start lg:items-stretch lg:flex-col lg:gap-4 lg:sticky">
          <div className={`${isSearchFocused ? 'grow' : isFilterOpen ? 'hidden lg:block' : 'basis-1/2'} min-w-0 field search transition-all duration-md ease-es max-h-10.5`}>
            <input 
              type='text' 
              placeholder='Search' 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (blurTimeoutRef.current) {
                  clearTimeout(blurTimeoutRef.current)
                  blurTimeoutRef.current = null
                }
                setIsSearchFocused(true)
              }}
              onBlur={() => {
                blurTimeoutRef.current = setTimeout(() => {
                  setIsSearchFocused(false)
                }, 100)
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label='Clear search'>
                <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Clear search</title></Icon>
              </button>
            )}
            <Icon name="icon-search" className="icon-search w-3 h-3 fill-black dark:fill-natural" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Search</title></Icon>
          </div>

          <div className={`${isSearchFocused ? 'hidden lg:flex' : isFilterOpen ? 'grow ml-auto' : 'basis-1/2'} min-w-0 bg-black/10 dark:bg-natural/10 rounded lg:rounded-none flex flex-col transition-all duration-md ease-es`}>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className='flex flex-row gap-2 justify-between items-center px-4 py-3 min-h-10.5 lg:pointer-events-none lg:cursor-default' type="button">
              <div className='text-black/60 dark:text-natural/60 text-xl lg:text-label-lg'>Categories <span className='text-label-lg'>{selectedCategories.length > 0 && `[ ${selectedCategories.length} ]`}</span></div>
              {isFilterOpen ? (
                <Icon name="icon-close" className="icon-close w-3 h-3 fill-black dark:fill-natural transition-opacity duration-md ease-es lg:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Close Filter</title></Icon>
              ) : (
                <Icon name="icon-filter" className="icon-filter w-3 h-3 fill-black dark:fill-natural transition-opacity duration-md ease-es lg:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Open Filter</title></Icon>
              )}
            </button>
            
            <div className={`grid transition-all duration-lg lg:duration-0 ease-es lg:grid-rows-[1fr]! lg:opacity-100! lg:p-4 lg:pt-2 ${isFilterOpen ? 'p-4' : 'p-0'}`} style={{ gridTemplateRows: isFilterOpen ? '1fr' : '0fr', opacity: isFilterOpen ? 1 : 0 }}>
              <ul className='overflow-hidden flex flex-col max-h-[calc(100vh-500px)] overflow-y-auto'>
              {parentCategories.map((parent, index) => {
                const children = getChildren(parent._id)
                const isSelected = selectedCategories.includes(parent._id)
                const parentCount = getCategoryCartCount(parent._id, true)

                return (
                  <div key={parent._id} className='flex flex-col fadein' style={{ animationDelay: `${index * 150}ms` }}>
                    <label className='checkbox grow px-2 lg:px-4 py-1.75 rounded flex flex-row items-center justify-start gap-2 duration-md ease-es cursor-pointer'>
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
                            <div key={child._id} className='flex flex-col fadein' style={{ animationDelay: `${childIndex * 150}ms` }}>
                              <label className='checkbox grow px-2 lg:px-4 py-1.75 rounded flex flex-row items-center justify-start gap-2 duration-md ease-es cursor-pointer'>
                                <input type='checkbox' checked={isChildSelected} onChange={() => toggleCategory(child._id)} />
                                <Icon name="icon-tick" className="icon-tick h-4 w-4 transition-opacity duration-md ease-es" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Check</title></Icon>
                                <span>{child.name}{childCount > 0 && ` (${childCount})`}</span>
                              </label>
                            </div>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </ul>
            </div>
          </div>
        </StickyContent>
        
      </StickyContent>

      <div className={`col-start-1 col-span-12 lg:col-start-7 lg:col-span-11 2xl:col-start-8 2xl:col-span-9 flex flex-col ${displayedViewMode === 'list' ? 'gap-0' : 'gap-6'}`}>
        {displayedItems.slice(0, visibleCount).map((item, index) => {
          const isNewItem = index >= previousVisibleCount
          
          return (
            <div
              key={item._id}
              className={`${
                animationPhase === 'fadeOut' ? 'fadeout' : 
                animationPhase === 'fadeIn' && isNewItem ? 'fadein' : ''
              }`}
              style={{
                animationDelay: animationPhase === 'fadeIn' && isNewItem 
                  ? `${(index - previousVisibleCount) * 50}ms` 
                  : '0ms'
              }}
            >
              <EquipmentItemCard 
                item={item} 
                viewMode={displayedViewMode}
                quantity={quantities[item._id] || 0}
                onQuantityChange={(qty) => updateQuantity(item._id, qty)}
                priority={index < 3}
              />
            </div>
          )
        })}
        
        {displayedItems.length > visibleCount && (
          <div className="flex flex-col gap-6 justify-center items-center pt-20 self-center w-1/2">
            <span>Showing {visibleCount} of {displayedItems.length} Items</span>
            <div className=' w-full bg-black dark:bg-natural flex rounded'>
              <div className='h-0.5 bg-natural/60 dark:bg-black/60' style={{ width: `${(visibleCount / displayedItems.length) * 100}%` }}></div>
            </div>
            <button onClick={handleLoadMore} className="btn" disabled={isAnimating}>Load More</button>
          </div>
        )}
      </div>
      <HideOnFooter translateAmount="translate-y-full">
        <div className='fixed lg:static pb-[calc(1rem+env(safe-area-inset-bottom))] bottom-0 left-0 right-0 bg-natural dark:bg-black lg:bg-transparent lg:dark:bg-transparent lg:col-start-20 lg:col-span-5 2xl:col-start-19 2xl:col-span-5 transition-colors duration-lg ease-es'>
          <StickyContent dTop={25.5} className='lg:sticky flex flex-col'>
            <div className="flex flex-col lg:bg-black/10 lg:dark:bg-natural/10 rounded overflow-hidden transition-colors duration-lg ease-es">
              <button onClick={() => setIsCartOpen(!isCartOpen)} className='flex flex-row justify-between w-full lg:cursor-default p-4' type="button">
                <div className="label">Your List<span className='lg:hidden pl-2'>[ {totalItems} ]</span></div>
                <Icon name="icon-chevron" className={`icon-chevron w-3 h-3 fill-black dark:fill-natural lg:hidden transition-transform duration-lg ease-es ${isCartOpen ? 'rotate-270' : 'rotate-90'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><title>Toggle Cart</title></Icon>
              </button>
              
              <div className={`grid transition-all duration-lg lg:duration-0 ease-es lg:grid-rows-[1fr]! lg:opacity-100! px-4 lg:pb-4 lg:pt-2 ${isCartOpen ? 'pb-6 pt-2' : 'py-0'}`} style={{ gridTemplateRows: isCartOpen ? '1fr' : '0fr', opacity: isCartOpen ? 1 : 0 }}>
                <div className="overflow-hidden">
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
                </div>
              </div>
              
              <div className="p-4 pt-1 lg:pt-4 flex flex-col">
                <EquipmentHireButton label="Hire Equipment" className="btn" equipment={equipment} global={global} />
              </div>

            </div>

            <div className='p-4 pt-0 lg:pt-4 self-end'>
              {equipmentListUrl && (
                <a href={equipmentListUrl} target="_blank" rel="noopener noreferrer" className="link line self-start">
                  <span>{equipmentListButtonLabel || 'Download Equipment List'}</span>
                  <Icon name="icon-download" className="icon-download fill-black dark:fill-natural h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Download</title></Icon>
                </a>
              )}
            </div>
            
          </StickyContent>
        </div>
      </HideOnFooter>
    </>
  )
}
