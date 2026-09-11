export default function Slide({
  slide,
  index,
  totalSlides,
  status,
  transitionType,
  direction,
  currentSlide,
}) {
  const isFirst = index === 0;
  const isAdjacent = Math.abs(index - (currentSlide ?? 0)) <= 1;
  const isCurrentOrIncoming = status === 'active' || status === 'entering';
  const isSlide1 = slide.id === 1;
  const isSlide7 = slide.id === 7;

  let stateClasses = 'slide--inactive';
  if (status === 'active') {
    stateClasses = 'slide--active';
  } else if (status === 'entering') {
    const dirClass = direction === 'next' ? 'slide--enter-next' : 'slide--enter-prev';
    stateClasses = `slide--entering ${dirClass} slide--${transitionType || 'base'}`;
  } else if (status === 'exiting') {
    const dirClass = direction === 'next' ? 'slide--exit-next' : 'slide--exit-prev';
    stateClasses = `slide--exiting ${dirClass} slide--${transitionType || 'base'}`;
  }

  const handleHotspotClick = (e) => {
    e.stopPropagation();
  };

  return (
    <section
      id={`slide-${slide.id}`}
      className={`slide ${stateClasses}`}
      aria-label={`Slide ${slide.id} of ${totalSlides} — ${slide.alt || slide.label || slide.title}`}
      aria-hidden={!isCurrentOrIncoming}
      role="group"
      aria-roledescription="slide"
      tabIndex={status === 'active' ? 0 : -1}
    >
      <div className="slide-media-container">
        <img
          src={slide.image}
          alt={slide.alt || `Slide ${slide.id}: ${slide.label || slide.title}`}
          className="slide-image"
          width={1920}
          height={1080}
          loading={isFirst || isAdjacent ? "eager" : "lazy"}
          fetchPriority={isFirst ? "high" : (isAdjacent ? "high" : "auto")}
          decoding="async"
          draggable={false}
        />

        {/* Phase 8: Interactive Instagram hotspot on Slide 01 */}
        {isSlide1 && (
          <div
            className="contact-hotspots-layer"
            aria-label="Interactive link"
            aria-hidden={status !== 'active'}
          >
            <a
              href="https://www.instagram.com/see.awkwards/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Instagram profile: @see.awkwards"
              className="contact-hotspot hotspot--hero-instagram"
              data-cursor="interactive"
              data-cursor-label="OPEN INSTAGRAM ↗"
              tabIndex={status === 'active' ? 0 : -1}
              onClick={handleHotspotClick}
            >
              <span className="hotspot-mobile-cue" aria-hidden="true">↗</span>
            </a>
          </div>
        )}

        {/* Phase 7 & 8: Interactive contact hotspots on Slide 07 */}
        {isSlide7 && (
          <div
            className="contact-hotspots-layer"
            aria-label="Contact links"
            aria-hidden={status !== 'active'}
          >
            <a
              href="mailto:officialpratiksha26@gmail.com"
              aria-label="Email: officialpratiksha26@gmail.com"
              className="contact-hotspot contact-hotspot--email"
              data-cursor="interactive"
              data-cursor-label="EMAIL ↗"
              tabIndex={status === 'active' ? 0 : -1}
              onClick={handleHotspotClick}
            >
              <span className="hotspot-mobile-cue" aria-hidden="true">↗</span>
            </a>
            <a
              href="tel:7620537043"
              aria-label="Phone: 7620537043"
              className="contact-hotspot contact-hotspot--phone"
              data-cursor="interactive"
              data-cursor-label="CALL ↗"
              tabIndex={status === 'active' ? 0 : -1}
              onClick={handleHotspotClick}
            >
              <span className="hotspot-mobile-cue" aria-hidden="true">↗</span>
            </a>
            <a
              href="https://www.instagram.com/see.awkwards/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Instagram profile: @see.awkwards"
              className="contact-hotspot contact-hotspot--instagram"
              data-cursor="interactive"
              data-cursor-label="OPEN INSTAGRAM ↗"
              tabIndex={status === 'active' ? 0 : -1}
              onClick={handleHotspotClick}
            >
              <span className="hotspot-mobile-cue" aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}



