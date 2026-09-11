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
    </section>
  );
}


