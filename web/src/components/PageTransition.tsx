"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const TransitionContext = createContext({ isTransitioning: false });

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathname = useRef<string | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [isWaitingForContent, setIsWaitingForContent] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isComingFromHome, setIsComingFromHome] = useState(false);
  const contentDetectionActive = useRef(false);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const pendingNavigationRef = useRef<string | null>(null);
  const contextValue = useMemo(() => ({ isTransitioning: isWaitingForContent }), [isWaitingForContent]);

  // FLOW 1: Detect navigation FROM homepage (triggered by HomeIntro)
  useEffect(() => {
    // First mount - initialize prevPathname
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    
    // Detect navigation from homepage to another page
    if (prevPathname.current === '/' && pathname !== '/') {
      setIsComingFromHome(true);
      setIsWaitingForContent(true);
    }
    
    // Update prevPathname for next navigation
    prevPathname.current = pathname;
  }, [pathname]);

  // Listen for fade-out transition to complete, then navigate
  useEffect(() => {
    const contentWrapper = contentWrapperRef.current;
    if (!contentWrapper) return;

    const handleTransitionEnd = (e: TransitionEvent) => {
      // Only proceed if this is the opacity transition on the content wrapper itself
      if (e.propertyName !== 'opacity' || e.target !== contentWrapper) return;
      
      // Only navigate if we have a pending navigation and we're fading out
      if (isFadingOut && pendingNavigationRef.current) {
        setIsWaitingForContent(true);
        router.push(pendingNavigationRef.current);
        pendingNavigationRef.current = null;
      }
    };

    contentWrapper.addEventListener('transitionend', handleTransitionEnd);
    return () => contentWrapper.removeEventListener('transitionend', handleTransitionEnd);
  }, [isFadingOut, router]);

  // Content detection - waits for main content and first image to load
  useEffect(() => {
    if (!isWaitingForContent) {
      contentDetectionActive.current = false;
      return;
    }
    
    // Prevent duplicate observer creation
    if (contentDetectionActive.current) return;
    contentDetectionActive.current = true;
    
    // Scroll to top when pathname changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let hasProcessed = false;
    
    const handleContentReady = () => {
      // FLOW 1: Coming from homepage - just fade in, no loading screen
      if (isComingFromHome) {
        setIsWaitingForContent(false);
        setIsComingFromHome(false);
        return;
      }
      
      // FLOW 2: Regular page transitions - hide loading screen and show new page
      setIsFadingOut(false);
      setIsWaitingForContent(false);
      setShowLoading(false);
    };
    
    const checkForContent = () => {
      if (hasProcessed) return;
      
      const main = document.querySelector('main');
      if (!main) return;
      
      // Check if main has actual content (not just being cleared)
      if (main.children.length === 0) return;
      
      // Mark as processed immediately to prevent multiple triggers
      hasProcessed = true;
      observer.disconnect();
      
      // Only wait for the first image (hero image) to avoid waiting for entire galleries
      const allImages = Array.from(main.querySelectorAll('img'));
      const images = allImages.length > 0 ? [allImages[0]] : [];
      
      if (images.length === 0) {
        handleContentReady();
        return;
      }
      
      // Wait for first image to load
      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => resolve());
        });
      });
      
      Promise.all(imagePromises).then(() => {
        handleContentReady();
      });
    };
    
    const observer = new MutationObserver(() => {
      checkForContent();
    });
    
    // Observe the body for any changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // For home-to-page transitions, content might already be rendered, so check immediately
    if (isComingFromHome) {
      setTimeout(() => checkForContent(), 0);
    }
    
    return () => {
      observer.disconnect();
      contentDetectionActive.current = false;
    };
  }, [isWaitingForContent, isComingFromHome]);

  // FLOW 2: Intercept link clicks on regular pages (not homepage)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
        // Allow default behavior for modifier keys (Cmd/Ctrl click for new tab, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return;
        }
        
        const linkUrl = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Don't intercept clicks when on homepage - let HomeIntro handle it
        const isOnHomepage = currentUrl.pathname === '/';
        if (isOnHomepage) {
          return;
        }
        
        // Only trigger transition if navigating to a different page
        if (linkUrl.pathname !== currentUrl.pathname) {
          e.preventDefault();
          
          // Store the URL we want to navigate to
          pendingNavigationRef.current = linkUrl.pathname + linkUrl.search + linkUrl.hash;
          
          // Start fade out of current page and show loading screen
          setIsFadingOut(true);
          setShowLoading(true);
          
          // Navigation will happen when fade-out transition completes (via transitionend event)
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [router]);

  return (
    <TransitionContext.Provider value={contextValue}>
      {/* Loading screen - fades in when transitioning, fades out when content ready */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-lg ease-es ${
          showLoading ? 'opacity-100' : 'opacity-0'
        }`}
        role="status"
        aria-live="polite"
        aria-label="Loading page content"
      >
        <div className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-bamboo dark:bg-natural animate-spin-slow" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
      
      {/* Page content - fades out when leaving, fades in when content ready */}
      <div 
        ref={contentWrapperRef}
        className={`${
          isFadingOut || isWaitingForContent ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-lg ease-es grow flex flex-col`}
        style={{
          // Disable transition on initial render when coming from home (prevents flash)
          transitionProperty: isComingFromHome && isWaitingForContent ? 'none' : 'opacity'
        }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
