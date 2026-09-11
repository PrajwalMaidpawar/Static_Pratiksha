/**
 * NavigationControls Component
 * Subtle directional cues (← PREV / NEXT →).
 * Respects transition locks and slide boundaries.
 */
export default function NavigationControls({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  isLocked,
}) {
  const hasPrev = currentSlide > 0;
  const hasNext = currentSlide < totalSlides - 1;

  return (
    <nav
      id="navigation-controls"
      className="navigation-controls"
      aria-label="Slide navigation cues"
    >
      {hasPrev && (
        <button
          id="nav-btn-prev"
          type="button"
          onClick={onPrev}
          disabled={isLocked}
          className="nav-cue-button"
          aria-label="Go to previous slide"
          data-cursor="interactive"
        >
          <span className="nav-cue-arrow" aria-hidden="true">←</span>
          <span className="nav-cue-label">PREV</span>
        </button>
      )}

      {hasNext && (
        <button
          id="nav-btn-next"
          type="button"
          onClick={onNext}
          disabled={isLocked}
          className="nav-cue-button"
          aria-label="Go to next slide"
          data-cursor="interactive"
        >
          <span className="nav-cue-label">NEXT</span>
          <span className="nav-cue-arrow" aria-hidden="true">→</span>
        </button>
      )}
    </nav>
  );
}
