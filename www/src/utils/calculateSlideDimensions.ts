/**
 * Calculate slide dimensions for given aspect ratio fitting slides in container.
 *
 * For example, on mobile devices, the container width is the limiting factor. To fit 1.2 slides
 * (allowing partial visibility for the next slide) with a 1:1 aspect ratio, we calculate the slide
 * height based on the available width, ensuring the slides are square and the carousel scrolls
 * smoothly with partial slide preview.
 *
 * @param options - Configuration object
 * @param options.containerDimension - The container dimension (height or width) that constrains the slides
 * @param options.dimensionType - Whether the container dimension is 'height' or 'width' (default: 'height')
 * @param options.aspectRatio - The aspect ratio as width/height ratio (default: 9/16 for vertical video)
 * @param options.slidesPerView - Number of slides to fit in the container (default: 1.2 for partial next slide)
 * @returns Object with slide width, height, and slidesPerView
 */
export function calculateSlideDimensions({
  containerDimension,
  dimensionType = 'height',
  aspectRatio = 9 / 16,
  slidesPerView = 1,
}: {
  containerDimension: number;
  dimensionType?: 'height' | 'width';
  aspectRatio?: number;
  slidesPerView?: number;
}) {
  let slideHeight: number;
  let slideWidth: number;

  if (dimensionType === 'height') {
    // Container height is the constraint
    slideHeight = containerDimension / slidesPerView;
    slideWidth = slideHeight * aspectRatio;
  } else {
    // Container width is the constraint
    slideWidth = containerDimension / slidesPerView;
    slideHeight = slideWidth / aspectRatio;
  }

  return {
    slideWidth,
    slideHeight,
    slidesPerView,
  };
}
