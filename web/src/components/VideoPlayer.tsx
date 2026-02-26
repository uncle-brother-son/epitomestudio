'use client'

import { useRef, useState, useEffect } from 'react'
import { Icon } from './Icons'

interface VideoPlayerProps {
  src: string
  className?: string
}

export default function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
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
    <div className={`relative group w-full rounded overflow-hidden ${className}`}>
      <video ref={videoRef} className="w-full" src={src} muted loop playsInline onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} >
        Your browser does not support the video tag.
      </video>

      <button onClick={togglePlay} className="group absolute inset-0 flex items-start justify-end p-4" aria-label={isPlaying ? 'Pause video' : 'Play video'}>
        <div className="p-1 rounded flex items-center justify-center bg-natural/5 group-hover:bg-natural/40 transition-colors duration-lg ease-es sticky bottom-4">
          <Icon name={isPlaying ? 'icon-pause' : 'icon-play'} className="w-4 h-4 fill-black" viewBox="0 0 14 14" />
        </div>
      </button>
    </div>
  )
}
