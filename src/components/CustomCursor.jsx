import { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor Component
 * Minimal, lightweight custom cursor for fine pointer (desktop) devices with hover support.
 * Automatically disabled on touch/mobile devices.
 * Uses requestAnimationFrame only when visible and pointer is active to maximize efficiency.
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorLabel, setCursorLabel] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop/laptop devices with fine pointer AND hover capability
    if (typeof window === 'undefined') return;
    const finePointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    if (!finePointerQuery.matches) return;

    setIsEnabled(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let rafId = null;
    let isMouseInside = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMouseInside) {
        isMouseInside = true;
        setIsVisible(true);
      }
    };

    const onMouseLeave = () => {
      isMouseInside = false;
      setIsVisible(false);
      setIsHovered(false);
      setCursorLabel('');
    };

    const onMouseEnter = () => {
      isMouseInside = true;
      setIsVisible(true);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const interactiveEl =
        target.closest('[data-cursor="interactive"]') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]');

      if (interactiveEl) {
        setIsHovered(true);
        const labeledEl = target.closest('[data-cursor-label]');
        setCursorLabel(labeledEl ? labeledEl.getAttribute('data-cursor-label') || '' : '');
      } else {
        setIsHovered(false);
        setCursorLabel('');
      }
    };

    const loop = () => {
      const el = cursorRef.current;
      if (el && isMouseInside) {
        if (prefersReducedMotion) {
          cursorX = mouseX;
          cursorY = mouseY;
        } else {
          // Smooth responsive follow with 0.25 lerp factor
          cursorX += (mouseX - cursorX) * 0.25;
          cursorY += (mouseY - cursorY) * 0.25;
        }
        el.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      id="custom-cursor"
      className={`custom-cursor ${isVisible ? 'custom-cursor--visible' : ''} ${
        isHovered ? 'custom-cursor--hover' : ''
      } ${cursorLabel ? 'custom-cursor--has-label' : ''}`}
      aria-hidden="true"
    >
      {cursorLabel && (
        <span className="custom-cursor-label">{cursorLabel}</span>
      )}
    </div>
  );
}

