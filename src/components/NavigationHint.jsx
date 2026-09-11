/**
 * NavigationHint Component
 * Subtle teaching cue for first-time presentation navigation.
 * Displayed on Slide 01 initially; fades out permanently after the user's first interaction.
 */
export default function NavigationHint({ isVisible, onInteract }) {
  return (
    <div
      id="navigation-hint"
      className={`navigation-hint ${isVisible ? 'navigation-hint--visible' : 'navigation-hint--hidden'}`}
      onClick={onInteract}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInteract();
        }
      }}
      role="button"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      aria-label="Scroll to explore presentation"
      data-cursor="interactive"
    >
      <span className="navigation-hint-text">SCROLL TO EXPLORE</span>
      <span className="navigation-hint-arrow" aria-hidden="true">↓</span>
    </div>
  );
}
