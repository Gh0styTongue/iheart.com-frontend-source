/**
 * Custom hook to handle smooth scrolling to the highlights section
 * when navigating to a highlights route.
 *
 * This hook checks if the current route is a highlights route and scrolls
 * to the highlights section with a smooth animation, accounting for a fixed header offset.
 */

import { RefObject, useEffect } from 'react';

type UseScrollToHighlightsParams = {
  /**
   * The clip slug and ID from route params (e.g., 'clip-name_123')
   */
  clipSlugAndId?: string;
  /**
   * Whether highlights should be shown on the page
   */
  showHighlights: boolean;
  /**
   * Ref to the highlights section element
   */
  highlightsRef: RefObject<HTMLDivElement>;
  /**
   * Whether the video map status is still loading
   * Scrolling will only occur after loading is complete
   */
  isLoading: boolean;
  /**
   * Optional header offset in pixels (default: 80)
   */
  headerOffset?: number;
  /**
   * Optional delay in milliseconds before scrolling (default: 300)
   */
  scrollDelay?: number;
};

function useScrollToHighlights({
  clipSlugAndId,
  showHighlights,
  highlightsRef,
  isLoading,
  headerOffset = 80,
  scrollDelay = 300,
}: UseScrollToHighlightsParams): void {
  useEffect(() => {
    // Check if we're on the highlights route (either with or without a specific clip)
    const isHighlightsRoute =
      clipSlugAndId || window.location.pathname.includes('/highlights');

    // Only scroll if we're on the highlights route, highlights are shown,
    // the ref exists, and loading is complete
    if (
      isHighlightsRoute &&
      highlightsRef.current &&
      showHighlights &&
      !isLoading
    ) {
      // Use setTimeout to ensure the DOM is fully rendered
      const timeoutId = setTimeout(() => {
        const element = highlightsRef.current;
        if (element) {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, scrollDelay);

      // Cleanup: clear timeout on unmount or when dependencies change
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Return undefined when no cleanup is needed
    return undefined;
  }, [
    clipSlugAndId,
    showHighlights,
    highlightsRef,
    isLoading,
    headerOffset,
    scrollDelay,
  ]);
}

export default useScrollToHighlights;
