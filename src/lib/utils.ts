/**
 * Determines whether the given element should have a marquee effect.
 *
 * Sets the `aniate-marquee` class on the child with `data-marquee='scroller'`.
 * @param {HTMLElement} el - The element to check.
 */
export const shouldMarquee = (el: HTMLElement) => {
  const scroller = el.querySelector<HTMLElement>('[data-marquee="scroller"]')!;
  scroller.style.removeProperty('--marquee-width');
  scroller.classList.remove('animate-marquee');

  const containerWidth = el.getBoundingClientRect()?.width ?? 0;
  const scrollerWidth = scroller.getBoundingClientRect()?.width ?? 0;

  if (containerWidth < scrollerWidth) {
    scroller.style.setProperty('--marquee-width', `${containerWidth}px`);
    scroller.classList.add('animate-marquee');
  } else {
    scroller.style.removeProperty('--marquee-width');
    scroller.classList.remove('animate-marquee');
  }
};
