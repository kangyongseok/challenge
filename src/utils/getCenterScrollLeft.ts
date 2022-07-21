export default function getCenterScrollLeft({
  scrollWidth,
  clientWidth,
  targetOffsetLeft,
  targetClientWidth
}: {
  scrollWidth: number;
  clientWidth: number;
  targetOffsetLeft: number;
  targetClientWidth: number;
}) {
  const targetLeft = targetOffsetLeft + targetClientWidth / 2;
  let scrollLeft = 0;

  if (targetLeft <= clientWidth / 2) {
    scrollLeft = 0;
  } else if (scrollWidth - targetLeft <= clientWidth / 2) {
    scrollLeft = scrollWidth - clientWidth;
  } else {
    scrollLeft = targetLeft - clientWidth / 2;
  }

  return scrollLeft;
}
