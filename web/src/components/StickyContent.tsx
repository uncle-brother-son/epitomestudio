'use client'

import { ReactNode, useEffect, useRef } from 'react'

interface StickyContentProps {
  children: ReactNode
  className?: string
  mTop?: number
  dTop?: number
}

export function StickyContent({ children, className = '', mTop, dTop }: StickyContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    let ticking = false
    
    const updatePosition = () => {
      const isMobile = window.innerWidth < 1024
      
      // Skip mobile if mTop not defined
      if (isMobile && mTop === undefined) {
        container.style.removeProperty('top')
        return
      }
      
      // Skip desktop if dTop not defined
      if (!isMobile && dTop === undefined) {
        container.style.removeProperty('top')
        return
      }
      
      // Use appropriate value
      const currentTop = isMobile ? mTop : dTop
      const topPx = (currentTop! / 4) * 16
      
      const header = document.querySelector('header')
      if (!header) return
      
      const headerStyle = window.getComputedStyle(header)
      const matrix = headerStyle.transform
      
      if (matrix && matrix !== 'none') {
        const values = matrix.match(/matrix\((.+)\)/)
        if (values && values[1]) {
          const matrixValues = values[1].split(', ')
          const headerTranslateY = parseFloat(matrixValues[5] || '0')
          const headerHeight = header.offsetHeight
          
          // Calculate offset: when header is fully visible (translateY=0), offset = headerHeight
          // when header is hidden (translateY=-headerHeight), offset = 0
          const offset = headerHeight + headerTranslateY
          
          container.style.setProperty('top', `${topPx + offset}px`)
        }
      }
      
      ticking = false
    }
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updatePosition)
        ticking = true
      }
    }
    
    const onResize = () => {
      updatePosition()
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    updatePosition()
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [mTop, dTop])
  
  return (
    <div 
      ref={containerRef}
      className={className}
    >
      {children}
    </div>
  )
}
