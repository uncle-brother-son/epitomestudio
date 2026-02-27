"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Icon } from "@/components/Icons";

const TransitionContext = createContext({ isTransitioning: false });

export function usePageTransition() {
  return useContext(TransitionContext);
}

type TransitionType = 'page-to-page' | 'page-to-home' | 'home-to-page' | null;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathname = useRef<string | null>(null);
  const contentDetectionActive = useRef(false);
  
  // Core transition states
  const [transitionType, setTransitionType] = useState<TransitionType>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isWaitingForContent, setIsWaitingForContent] = useState(false);
  const [wipePhase, setWipePhase] = useState<'in' | 'out' | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const contextValue = useMemo(() => ({ isTransitioning: isWaitingForContent }), [isWaitingForContent]);

  // ============================================================================
  // FLOW 3: Detect navigation FROM homepage (triggered by HomeIntro)
  // ============================================================================
  // Use useLayoutEffect to run synchronously before paint
  useLayoutEffect(() => {
    // First mount - initialize prevPathname
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    
    if (prevPathname.current === '/' && pathname !== '/') {
      setTransitionType('home-to-page');
      setIsWaitingForContent(true);
      // Don't update prevPathname yet - wait until transition completes
      return;
    }
    // Update prevPathname for other navigation (not from homepage)
    prevPathname.current = pathname;
  }, [pathname]);

  // ============================================================================
  // CONTENT DETECTION: Shared logic for all transitions
  // ============================================================================
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
    
    // Use MutationObserver to detect when main content changes
    let hasProcessed = false;
    
    const handleContentReady = () => {
      if (transitionType === 'page-to-page') {
        // Show loading screen wipe-out, then fade in page
        setIsWaitingForContent(false);
        setWipePhase('out');
        setTimeout(() => {
          setWipePhase(null);
          setTransitionType(null);
        }, 960);
        
      } else if (transitionType === 'home-to-page') {
        // No loading screen, just fade in page
        // Update prevPathname BEFORE the setTimeout so isComingFromHome becomes false
        setIsWaitingForContent(false);
        prevPathname.current = pathname;
        setTimeout(() => {
          setTransitionType(null);
        }, 200);
        
      } else if (transitionType === 'page-to-home') {
        // No fade-in, just show immediately
        setIsWaitingForContent(false);
        setTransitionType(null);
      }
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
      const videos = Array.from(main.querySelectorAll('video'));
      const totalMedia = images.length + videos.length;
      
      if (totalMedia === 0) {
        handleContentReady();
        return;
      }
      
      // Wait for images to load
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
    
    // For home-to-page transitions, content is already rendered, so check immediately
    if (transitionType === 'home-to-page') {
      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => checkForContent(), 0);
    }
    
    return () => {
      observer.disconnect();
      contentDetectionActive.current = false;
    };
  }, [isWaitingForContent, transitionType, pathname]);

  // ============================================================================
  // FLOW 1 & 2: Intercept clicks on standard pages (not homepage)
  // ============================================================================
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
        // Allow default behavior for modifier keys
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
          
          const isGoingToHome = linkUrl.pathname === '/';
          const type: TransitionType = isGoingToHome ? 'page-to-home' : 'page-to-page';
          
          setTransitionType(type);
          setIsFadingOut(true);
          
          // Show loading screen only for page-to-page transitions
          if (type === 'page-to-page') {
            setWipePhase('in');
          }
          
          // Wait for exit animation (960ms) then navigate
          setTimeout(() => {
            setIsFadingOut(false);
            setIsWaitingForContent(true); // Wait for new content to load for all transitions
            router.push(linkUrl.pathname + linkUrl.search + linkUrl.hash);
          }, 960);
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [router]);

  // ============================================================================
  // RENDER
  // ============================================================================
  // Check if we're transitioning from homepage - this prevents flash on first render
  const isComingFromHome = prevPathname.current === '/' && pathname !== '/';
  
  return (
    <TransitionContext.Provider value={contextValue}>
      {/* Loading screen - only for page-to-page transitions */}
      {transitionType === 'page-to-page' && wipePhase && (
        <div 
          className={`fixed inset-0 z-50 pointer-events-none ${
            wipePhase === 'in' ? 'animate-wipe-in' : 'animate-wipe-out'
          }`}
          role="status"
          aria-live="polite"
          aria-label="Loading page content"
        >
          <div className="absolute inset-0 bg-bamboo transition-colors duration-md ease-es" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="icon-logo" className="icon-logo fill-natural h-5 transition-colors duration-md ease-es" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266 24"><title>Epitomestudio</title></Icon>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      {/* Page content with fade transitions */}
      <div 
        className={`${
          isFadingOut || isWaitingForContent || isComingFromHome
            ? 'opacity-0 translate-y-0'
            : 'opacity-100 translate-y-0'
        } transition-all duration-lg ease-es grow flex flex-col`}
        style={{ 
          // Disable transition only when hiding on initial render (isComingFromHome without transitionType set yet)
          transitionProperty: (isComingFromHome && !transitionType) ? 'none' : 'all', 
          transitionDuration: '960ms' 
        }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
