'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { urlFor } from '@/lib/sanityImage'
import { Icon } from '@/components/Icons'
import type { Card } from '@/queries/home'

type AnimationPhase = 'logo-in' | 'logo-out' | 'cards-in' | 'complete'

interface HomeIntroProps {
  cards: Card[]
}

export function HomeIntro({ cards }: HomeIntroProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<AnimationPhase>('logo-in')
  const [hasAnimated, setHasAnimated] = useState(false)
  const [maskingOut, setMaskingOut] = useState(false)
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)
  const [fadingOut, setFadingOut] = useState(false)
  const [targetPath, setTargetPath] = useState<string | null>(null)

  const getCardLink = (card: Card) => {
    switch (card.linkType) {
      case 'home':
        return '/'
      case 'studio':
        return '/studio-hire'
      case 'equipment':
        return '/equipment-hire'
      case 'production':
        return '/production'
      case 'contact':
        return '/contact'
      case 'legal':
        return card.legalPage?.slug?.current ? `/legal/${card.legalPage.slug.current}` : '/'
      default:
        return '/'
    }
  }

  const handleCardClick = (card: Card, index: number, e: React.MouseEvent) => {
    e.preventDefault()
    
    // Don't trigger if already animating
    if (maskingOut) return
    
    const link = getCardLink(card)
    setTargetPath(link)
    setClickedIndex(index)
    setMaskingOut(true)
    
    // Wait for expansion (960ms), hold (480ms), then fade out (960ms), then navigate
    setTimeout(() => {
      setFadingOut(true)
    }, 1440) // 960ms expansion + 480ms delay
    
    setTimeout(() => {
      router.push(link)
    }, 2400) // 960ms expansion + 480ms delay + 960ms fade
  }

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setPhase('complete')
      setHasAnimated(true)
      return
    }

    // Animation sequence
    const logoOutTimer = setTimeout(() => setPhase('logo-out'), 960)
    const cardsInTimer = setTimeout(() => setPhase('cards-in'), 1920)
    const completeTimer = setTimeout(() => {
      setPhase('complete')
      setHasAnimated(true)
    }, 3840)

    return () => {
      clearTimeout(logoOutTimer)
      clearTimeout(cardsInTimer)
      clearTimeout(completeTimer)
    }
  }, [])

  const showLogo = phase === 'logo-in' || phase === 'logo-out'
  const showCards = phase === 'cards-in' || phase === 'complete'

  return (
    <main id="main-content">
      <div className="h-screen w-screen flex flex-col lg:flex-row">
        {cards.map((card, index) => {
          const isFirst = index === 0
          const isLast = index === cards.length - 1
          const isMiddle = !isFirst && !isLast
          const isClickedCard = clickedIndex === index
          
          // Calculate animation delay for each card (in ms)
          const cardDelay = (index / 2) * 480
          
          return (
            <a
              key={card._key}
              href={getCardLink(card)}
              onClick={(e) => handleCardClick(card, index, e)}
              className={`group relative overflow-hidden transition-all duration-lg ease-es cursor-pointer ${
                maskingOut
                  ? isClickedCard
                    ? 'flex-1 z-10'
                    : 'flex-[0]'
                  : 'flex-1 hover:flex-[1.1]'
              }`}
              style={
                maskingOut
                  ? isClickedCard
                    ? {
                        transitionDuration: '960ms',
                        transitionTimingFunction: 'cubic-bezier(0.295, 0.850, 0.440, 1.000)',
                        opacity: fadingOut ? 0 : 1
                      }
                    : {
                        transitionDuration: '960ms',
                        transitionTimingFunction: 'cubic-bezier(0.295, 0.850, 0.440, 1.000)'
                      }
                  : showCards
                  ? {
                      animation: `unmask-from-bottom 960ms cubic-bezier(0.295, 0.850, 0.440, 1.000) ${cardDelay}ms backwards`
                    }
                  : {
                      clipPath: 'inset(100% 0 0 0)'
                    }
              }
            >
              <div className="lg:absolute lg:inset-y-0 lg:w-screen lg:left-1/2 lg:-translate-x-1/2 overflow-hidden">
                {card.video?.asset?.url ? (
                  <video src={card.video.asset.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : card.image?.asset ? (
                  <Image src={urlFor(card.image.asset).width(800).height(1000).url()} alt={card.title} fill className="object-cover" priority /> 
                ) : null}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className={`absolute inset-0 bg-black/20 transition-opacity duration-lg ease-es ${
                    maskingOut && isClickedCard ? 'opacity-0' : 'opacity-100'
                  }`} 
                />
                <h2 className="relative text-lg font-medium uppercase text-natural">
                  {card.title}
                </h2>
              </div>
            </a>
          )
        })}
      </div>

      {showLogo && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <Icon name="icon-logo" className="icon-logo fill-black h-5" style={{ animation: `logo-sequence 1920ms ease-in-out 0ms both` }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266 24"><title>Epitomestudio</title></Icon>
        </div>
      )}
    </main>
  )
}
