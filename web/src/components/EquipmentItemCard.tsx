'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanityImage'
import type { EquipmentItem } from '@/queries/equipment'
import { Icon } from './Icons'

export function EquipmentItemCard({ item, viewMode, quantity, onQuantityChange, priority = false }: { 
  item: EquipmentItem
  viewMode: 'image' | 'list'
  quantity: number
  onQuantityChange: (quantity: number) => void
  priority?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Count total list items in description
  const listItemCount = item.description?.reduce((count: number, block: any) => {
    if (block._type === 'block' && block.listItem === 'bullet') {
      return count + 1
    }
    return count
  }, 0) || 0

  const itemLimit = isMobile ? 4 : 8
  const hasMoreItems = listItemCount > itemLimit

  const components = {
    list: {
      bullet: ({ children }: any) => {
        const items = Array.isArray(children) ? children : [children]
        const itemLimit = isMobile ? 4 : 8
        const displayItems = isExpanded ? items : items.slice(0, itemLimit)
        
        return <ul>{displayItems}</ul>
      },
    },
  }

  if (viewMode === 'list') {
    return (
      <div className={`group flex flex-row gap-x-4 items-center hover:bg-black/5 dark:hover:bg-natural/5 rounded py-2 px-4 -mx-4 transition-colors duration-md ease-es ${quantity > 0 ? 'bg-black/5 dark:bg-natural/5' : ''}`}>
        <div className="grow">
          <h2 className="text-lg">
            {item.brand} {item.name}
          </h2>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          <button className={`qty opacity-0 ${quantity === 0 ? 'group-hover:opacity-60' : 'group-hover:opacity-100'}`} onClick={() => onQuantityChange(Math.max(0, quantity - 1))}>
            <Icon name="icon-minus" className="icon-minus w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease quantity</title></Icon>
          </button>
          <span className="text-lg w-4 text-center">{quantity}</span>
          <button className="qty opacity-0 group-hover:opacity-100" onClick={() => onQuantityChange(quantity + 1)}>
            <Icon name="icon-plus" className="icon-plus w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Increase quantity</title></Icon>
          </button>
        </div>
        <div>
          <p className="text-lg w-8 text-right">£{item.price}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row gap-x-4">
      {item.image && (
        <div className="relative shrink-0 w-[calc(((100vw-216px)/6)+24px)] aspect-4/5 rounded overflow-hidden self-start">
          <Image className="object-cover" src={urlFor(item.image).width(800).height(1000).url()} alt={`${item.brand} ${item.name}`} fill sizes="(max-width: 900px) 40vw, 20vw" priority={priority} />
        </div>
      )}
      <div className="grow flex flex-row gap-x-4 py-2">
        <div className="grow">
          <h2 className="text-lg pb-2">
            {item.brand} {item.name}
          </h2>
          {item.description && (
            <div className="pb-4 rich">
              <PortableText value={item.description} components={components} />
            </div>
          )}
          {hasMoreItems && (
            <button 
              className="link" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>{isExpanded ? 'Less Info' : 'More Info'}</span>
            </button>
          )}
        </div>
        <div className="flex flex-row gap-2 self-start justify-center items-center">
          <button className={`qty ${quantity === 0 ? 'opacity-60' : ''}`} onClick={() => onQuantityChange(Math.max(0, quantity - 1))}>
            <Icon name="icon-minus" className="icon-minus w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Decrease quantity</title></Icon>
          </button>
          <span className="text-lg w-4 text-center">{quantity}</span>
          <button className="qty" onClick={() => onQuantityChange(quantity + 1)}>
            <Icon name="icon-plus" className="icon-plus w-3 h-3 fill-natural dark:fill-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><title>Increase quantity</title></Icon>
          </button>
        </div>
        <div>
          <p className="text-lg w-8 text-right">£{item.price}</p>
        </div>
      </div>
    </div>
  )
}
