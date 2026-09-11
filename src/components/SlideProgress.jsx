import { useEffect, useState } from 'react';

/**
 * SlideProgress Component
 * Renders an understated, editorial slide counter: 01 / 07 through 07 / 07.
 * Updates in sync with slide transitions with subtle text replacement.
 */
export default function SlideProgress({ currentSlide, totalSlides }) {
  const [displayIndex, setDisplayIndex] = useState(currentSlide);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (currentSlide !== displayIndex) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayIndex(currentSlide);
        setIsFlipping(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, displayIndex]);

  const currentFormatted = String(displayIndex + 1).padStart(2, '0');
  const totalFormatted = String(totalSlides).padStart(2, '0');

  return (
    <div
      id="slide-progress"
      className="slide-progress"
      aria-label={`Slide ${currentFormatted} of ${totalFormatted}`}
      aria-live="polite"
      role="status"
    >
      <span className={`slide-progress-current ${isFlipping ? 'slide-progress-flip' : ''}`}>
        {currentFormatted}
      </span>
      <span className="slide-progress-divider" aria-hidden="true">
        /
      </span>
      <span className="slide-progress-total" aria-hidden="true">
        {totalFormatted}
      </span>
    </div>
  );
}
