'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePageTransition } from './PageTransition';

interface RevealProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function Reveal({ children, className = '', index }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isTransitioning } = usePageTransition();
  const hasInitialized = useRef(false);

  const staggerDelay = index !== undefined ? index * 150 : 0; // 150ms between each item

  // Initial styles - fade only
  const initialStyle: React.CSSProperties = {
    opacity: 0,
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Mark as initialized
    hasInitialized.current = true;

    // Wait for page transition to complete
    if (isTransitioning) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && element) {
          element.classList.add('fadein');
          // Apply stagger delay if index is provided
          if (staggerDelay > 0) {
            element.style.animationDelay = `${staggerDelay}ms`;
          }
          // Reset inline styles to let CSS animation take over
          element.style.opacity = '';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isTransitioning, staggerDelay]);

  // Handle exit animation when transitioning away
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !hasInitialized.current) return;

    if (isTransitioning) {
      element.style.transition = 'opacity 960ms cubic-bezier(0.295, 0.850, 0.440, 1.000)';
      element.style.opacity = '0';
    }
  }, [isTransitioning]);

  return (
    <div ref={elementRef} className={className} style={initialStyle}>
      {children}
    </div>
  );
}

export default Reveal;
