import { useState, useRef, useEffect, useCallback } from 'react';
import Slide from './Slide.jsx';
import SlideProgress from './SlideProgress.jsx';
import NavigationHint from './NavigationHint.jsx';
import NavigationControls from './NavigationControls.jsx';
import CustomCursor from './CustomCursor.jsx';
import { slides } from '../data/slides.js';

const DEFAULT_TRANSITION_DURATION = 850; // ms (smooth editorial transition)
const CONTACT_TRANSITION_DURATION = 900; // ms (calmer, slower ending transition)
const WHEEL_THRESHOLD = 90;              // accumulated delta threshold
const TOUCH_THRESHOLD = 50;              // px swipe threshold
const WHEEL_IDLE_RESET = 200;            // ms without wheel events resets accumulated delta
const MOMENTUM_SETTLE_TIME = 120;        // ms without wheel events considered settled

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [direction, setDirection] = useState('next');
  const [transitionType, setTransitionType] = useState('base');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const totalSlides = slides.length;

  // Refs for high-frequency input state to avoid stale closures & unnecessary renders
  const currentSlideRef = useRef(0);
  const isLockedRef = useRef(false);
  const accumulatedDeltaRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const unlockTimeoutRef = useRef(null);
  const transitionEndTimeoutRef = useRef(null);
  const wheelIdleTimeoutRef = useRef(null);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const isTouchActiveRef = useRef(false);
  const containerRef = useRef(null);

  // Central navigation function - all input methods call this same function
  const goToSlide = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, targetIndex));

    // If already at target slide or currently locked during an active transition, ignore
    if (clampedIndex === currentSlideRef.current || isLockedRef.current) {
      accumulatedDeltaRef.current = 0;
      return;
    }

    const fromIndex = currentSlideRef.current;
    const toIndex = clampedIndex;
    const dir = toIndex > fromIndex ? 'next' : 'previous';

    // Determine specific transition type based on adjacent slide pair
    let tType = 'base';
    if (Math.abs(toIndex - fromIndex) === 1) {
      const minIdx = Math.min(fromIndex, toIndex);
      if (minIdx === 0) tType = 't01';      // Hero <-> Introduction
      else if (minIdx === 1) tType = 't12'; // Introduction <-> My Content
      else if (minIdx === 2) tType = 't23'; // My Content <-> Reels
      else if (minIdx === 3) tType = 't34'; // Reels <-> Brand Works
      else if (minIdx === 4) tType = 't45'; // Brand Works <-> Collaboration Formats
      else if (minIdx === 5) tType = 't56'; // Collaboration Formats <-> Contact
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animDuration = prefersReducedMotion
      ? 150
      : (tType === 't56' ? CONTACT_TRANSITION_DURATION : DEFAULT_TRANSITION_DURATION);

    // Lock navigation immediately to enforce strictly one slide per gesture
    isLockedRef.current = true;
    accumulatedDeltaRef.current = 0;
    currentSlideRef.current = toIndex;

    // Clear any pending timers
    if (unlockTimeoutRef.current) {
      clearTimeout(unlockTimeoutRef.current);
    }
    if (transitionEndTimeoutRef.current) {
      clearTimeout(transitionEndTimeoutRef.current);
    }

    // Mark that user has interacted so navigation hint can disappear permanently
    setHasInteracted(true);

    // Trigger transition state
    setDirection(dir);
    setTransitionType(tType);
    setPreviousSlide(fromIndex);
    setCurrentSlide(toIndex);
    setIsTransitioning(true);

    // Conclude visual transition after animation completes
    transitionEndTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setPreviousSlide(null);
    }, animDuration);

    // Safely unlock navigation after animation ends & trackpad momentum subsides
    const checkAndUnlock = () => {
      const timeSinceLastWheel = Date.now() - lastWheelTimeRef.current;
      if (timeSinceLastWheel < MOMENTUM_SETTLE_TIME) {
        unlockTimeoutRef.current = setTimeout(checkAndUnlock, 100);
        return;
      }
      isLockedRef.current = false;
      accumulatedDeltaRef.current = 0;
    };

    unlockTimeoutRef.current = setTimeout(checkAndUnlock, animDuration);
  }, [totalSlides]);

  // Wheel handler with threshold accumulation & momentum suppression
  const handleWheel = useCallback((e) => {
    // Intercept wheel navigation to prevent native continuous page scrolling
    e.preventDefault();

    const now = Date.now();
    lastWheelTimeRef.current = now;

    // If navigation is locked during transition, discard delta
    if (isLockedRef.current) {
      accumulatedDeltaRef.current = 0;
      return;
    }

    // Ignore primarily horizontal wheel movements
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      return;
    }

    // Reset idle timer - clear accumulated delta if user pauses scrolling
    if (wheelIdleTimeoutRef.current) {
      clearTimeout(wheelIdleTimeoutRef.current);
    }
    wheelIdleTimeoutRef.current = setTimeout(() => {
      accumulatedDeltaRef.current = 0;
    }, WHEEL_IDLE_RESET);

    // Accumulate vertical delta
    accumulatedDeltaRef.current += e.deltaY;

    // Check if accumulated delta crossed the threshold
    if (accumulatedDeltaRef.current >= WHEEL_THRESHOLD) {
      // Positive delta -> Next slide
      accumulatedDeltaRef.current = 0;
      goToSlide(currentSlideRef.current + 1);
    } else if (accumulatedDeltaRef.current <= -WHEEL_THRESHOLD) {
      // Negative delta -> Previous slide
      accumulatedDeltaRef.current = 0;
      goToSlide(currentSlideRef.current - 1);
    }
  }, [goToSlide]);

  // Touch handlers for vertical swipe navigation
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    isTouchActiveRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isTouchActiveRef.current) return;
    // Prevent native bounce and rubber-band scrolling
    if (e.cancelable) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!isTouchActiveRef.current) return;
    isTouchActiveRef.current = false;

    if (isLockedRef.current) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = touchStartYRef.current - endY;
    const deltaX = touchStartXRef.current - endX;

    // Must be predominantly vertical swipe crossing threshold
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) >= TOUCH_THRESHOLD) {
      if (deltaY > 0) {
        // Swiped upward -> Next slide
        goToSlide(currentSlideRef.current + 1);
      } else {
        // Swiped downward -> Previous slide
        goToSlide(currentSlideRef.current - 1);
      }
    }
  }, [goToSlide]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
      case ' ': // Space
        e.preventDefault();
        goToSlide(currentSlideRef.current + 1);
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        goToSlide(currentSlideRef.current - 1);
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;

      default:
        break;
    }
  }, [goToSlide, totalSlides]);

  // Preload adjacent slide images into browser cache to avoid navigation delay
  useEffect(() => {
    const nextIdx = currentSlide + 1;
    const prevIdx = currentSlide - 1;
    [nextIdx, prevIdx].forEach((idx) => {
      if (idx >= 0 && idx < totalSlides && slides[idx]?.image) {
        const img = new Image();
        img.src = slides[idx].image;
      }
    });
  }, [currentSlide, totalSlides]);

  // Handle visibility changes and viewport orientation changes
  useEffect(() => {
    const settleTransition = () => {
      if (isLockedRef.current || transitionEndTimeoutRef.current) {
        if (transitionEndTimeoutRef.current) {
          clearTimeout(transitionEndTimeoutRef.current);
          transitionEndTimeoutRef.current = null;
        }
        if (unlockTimeoutRef.current) {
          clearTimeout(unlockTimeoutRef.current);
          unlockTimeoutRef.current = null;
        }
        setIsTransitioning(false);
        setPreviousSlide(null);
        isLockedRef.current = false;
        accumulatedDeltaRef.current = 0;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        settleTransition();
      }
    };

    const handleOrientationChange = () => {
      settleTransition();
    };

    const handleWindowResize = () => {
      if (isLockedRef.current) {
        settleTransition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Attach and clean up event listeners
  useEffect(() => {
    const container = containerRef.current;

    // Window wheel listener with passive: false to allow e.preventDefault()
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
      if (transitionEndTimeoutRef.current) {
        clearTimeout(transitionEndTimeoutRef.current);
      }
      if (wheelIdleTimeoutRef.current) {
        clearTimeout(wheelIdleTimeoutRef.current);
      }
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <main
      ref={containerRef}
      id="presentation"
      className="presentation"
      role="region"
      aria-label="Creative Portfolio Presentation Deck"
      tabIndex={-1}
    >
      {/* Visually hidden screen reader status announcement */}
      <div
        id="slide-announcer"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {`Slide ${currentSlide + 1} of ${totalSlides}: ${slides[currentSlide]?.alt || slides[currentSlide]?.title}`}
      </div>

      <div
        id="presentation-stage"
        className="presentation-stage"
      >
        {slides.map((slide, index) => {
          let status = 'inactive';
          if (isTransitioning) {
            if (index === currentSlide) {
              status = 'entering';
            } else if (index === previousSlide) {
              status = 'exiting';
            }
          } else {
            if (index === currentSlide) {
              status = 'active';
            }
          }

          return (
            <Slide
              key={slide.id}
              slide={slide}
              index={index}
              totalSlides={totalSlides}
              status={status}
              transitionType={transitionType}
              direction={direction}
              currentSlide={currentSlide}
            />
          );
        })}
      </div>

      {/* Presentation UI Overlays (Phase 4) */}
      <NavigationControls
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onPrev={() => goToSlide(currentSlide - 1)}
        onNext={() => goToSlide(currentSlide + 1)}
        isLocked={isTransitioning}
      />

      <NavigationHint
        isVisible={currentSlide === 0 && !hasInteracted}
        onInteract={() => goToSlide(1)}
      />

      <SlideProgress
        currentSlide={currentSlide}
        totalSlides={totalSlides}
      />

      <CustomCursor />
    </main>
  );
}

