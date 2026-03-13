'use client'

import { useRef, useState, useEffect } from 'react'
import { Icon } from './Icons'

interface VideoPlayerProps {
  src: string
  className?: string
  aspectRatio?: string // e.g., "aspect-video", "aspect-square", "aspect-4/5"
}

export default function VideoPlayer({ src, className = '', aspectRatio = 'aspect-video' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Don't autoplay if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsPlaying(false)
      return
    }

    // Attempt to autoplay when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, set state to paused
        setIsPlaying(false)
      })
    }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className={`relative group w-full rounded flex flex-col ${aspectRatio}`}>
      
      <button onClick={togglePlay} className="grow group flex flex-col items-end justify-end p-4" aria-label={isPlaying ? 'Pause video' : 'Play video'}>
        <div className="sticky bottom-4 p-1 rounded flex items-center justify-center bg-black/20 group-hover:bg-black/60 transition-colors duration-lg ease-es">
          <Icon name={isPlaying ? 'icon-pause' : 'icon-play'} className={`${isPlaying ? 'icon-pause' : 'icon-play'} w-4 h-4 fill-natural`} viewBox="0 0 14 14" />
        </div>
      </button>
      
      <video ref={videoRef} className={`absolute inset-0 -z-10 w-full h-full object-cover ${aspectRatio}`} src={src} muted loop playsInline onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} >
        Your browser does not support the video tag.
      </video>

      
    </div>
  )
}
