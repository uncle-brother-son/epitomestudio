'use client'

import { createContext, useContext, useState, useRef, ReactNode, MutableRefObject } from 'react'

interface HeaderScrollContextType {
  translateY: number
  setTranslateY: (value: number) => void
}

const HeaderScrollContext = createContext<HeaderScrollContextType>({
  translateY: 0,
  setTranslateY: () => {},
})

// Separate context for ref - never changes, never causes re-renders
const HeaderScrollRefContext = createContext<MutableRefObject<number>>({ current: 0 })

export function HeaderScrollProvider({ children }: { children: ReactNode }) {
  const [translateY, setTranslateY] = useState(0)
  const translateYRef = useRef(0)
  
  // Keep ref in sync
  translateYRef.current = translateY
  
  return (
    <HeaderScrollRefContext.Provider value={translateYRef}>
      <HeaderScrollContext.Provider value={{ translateY, setTranslateY }}>
        {children}
      </HeaderScrollContext.Provider>
    </HeaderScrollRefContext.Provider>
  )
}

export function useHeaderScroll() {
  return useContext(HeaderScrollContext)
}

export function useHeaderScrollRef() {
  return useContext(HeaderScrollRefContext)
}
