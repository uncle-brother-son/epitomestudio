import { useRef, useEffect } from 'react'

interface AnimatedMessageProps {
  show: boolean
  children: React.ReactNode
  className?: string
  ariaLive?: 'polite' | 'assertive' | 'off'
  role?: string
}

export function AnimatedMessage({ show, children, className = '', ariaLive = 'polite', role }: AnimatedMessageProps) {
  const contentRef = useRef<React.ReactNode>(null)
  
  // Store content when show is true so it persists during fade-out
  useEffect(() => {
    if (show) {
      contentRef.current = children
    }
  }, [show, children])
  
  return (
    <div 
      className="grid ease-es" 
      style={{ 
        gridTemplateRows: show ? '1fr' : '0fr',
        opacity: show ? 1 : 0,
        transition: show 
          ? 'grid-template-rows 0.48s cubic-bezier(0.295, 0.850, 0.440, 1.000), opacity 0.48s cubic-bezier(0.295, 0.850, 0.440, 1.000) 0.24s'
          : 'opacity 0.48s cubic-bezier(0.295, 0.850, 0.440, 1.000), grid-template-rows 0.48s cubic-bezier(0.295, 0.850, 0.440, 1.000) 0.24s'
      }}
      aria-live={show ? ariaLive : 'off'}
      {...(role && { role })}
    >
      <div className="overflow-hidden">
        <div className={className}>
          {show ? children : contentRef.current}
        </div>
      </div>
    </div>
  )
}
