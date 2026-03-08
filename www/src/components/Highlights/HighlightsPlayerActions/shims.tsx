import analytics, { Events } from 'modules/Analytics';

import trackers from 'trackers';
import type {
  HighlightsCTAClickData,
  HighlightsPageViewData,
  HighlightsPauseData,
  HighlightsPlayData,
  HighlightsSDK,
  HighlightsShareData,
  HighlightsStreamEndData,
  HighlightsStreamStartData,
  HighlightsTrackEndData,
  HighlightsTrackStartData,
} from './types';

// Re-export types for convenience
export type {
  HighlightsStreamStartData,
  HighlightsStreamEndData,
  HighlightsTrackStartData,
  HighlightsTrackEndData,
  HighlightsPlayData,
  HighlightsPauseData,
  HighlightsShareData,
  HighlightsPageViewData,
};

/**
 * Highlights Player Action Handlers
 * These functions are called via SDK callbacks and trigger analytics events
 */

/**
 * Handle Highlights Stream Start event
 * Triggered when a highlights stream begins playing
 */
export function handleHighlightsStreamStart(data: HighlightsStreamStartData) {
  analytics.track(Events.StreamStart, data);
  trackers.track(Events.HighlightsStreamStart);
}

/**
 * Handle Highlights Stream End event
 * Triggered when a highlights stream ends
 */
export function handleHighlightsStreamEnd(data: HighlightsStreamEndData) {
  analytics.track(Events.StreamEnd, data);
}

/**
 * Handle Highlights Track Start event
 * Triggered when a track within a highlight starts playing
 */
export function handleHighlightsTrackStart(data: HighlightsTrackStartData) {
  analytics.track(Events.TrackStart, data);
}

/**
 * Handle Highlights Track End event
 * Triggered when a track within a highlight ends
 */
export function handleHighlightsTrackEnd(data: HighlightsTrackEndData) {
  analytics.track(Events.TrackEnd, data);
}

/**
 * Handle Highlights Play event
 * Triggered when highlights playback starts or resumes
 */
export function handleHighlightsPlay(data: HighlightsPlayData) {
  analytics.track(Events.Play, data);
}

/**
 * Handle Highlights Pause event
 * Triggered when highlights playback is paused
 */
export function handleHighlightsPause(data: HighlightsPauseData) {
  analytics.track(Events.Pause, data);
}

/**
 * Handle Highlights Share event
 * Triggered when user shares a highlight
 */
export function handleHighlightsShare(data: HighlightsShareData) {
  analytics.track(Events.Share, data);
}

/**
 * Handle Highlights Page View event
 * Triggered when highlights player view changes
 */
export function handleHighlightsPageView(data: HighlightsPageViewData) {
  analytics.trackPageView?.(data);
}

/**
 * Handle Highlights Click event
 * Triggered when highlights player Watch Full Episode, Listen Live CTA clicked
 */
export function handleHighlightsClick(data: HighlightsCTAClickData) {
  analytics.track(Events.Click, data);
}

/**
 * Register all highlights player callbacks with the SDK
 * Call this function when initializing the Highlights SDK
 */
export function registerHighlightsPlayerCallbacks(
  sdk: Pick<HighlightsSDK, 'on'> | null | undefined,
) {
  if (!sdk) {
    return;
  }

  // Register callbacks similar to authCallback pattern
  sdk.on?.('streamStart', handleHighlightsStreamStart);
  sdk.on?.('streamEnd', handleHighlightsStreamEnd);
  sdk.on?.('trackStart', handleHighlightsTrackStart);
  sdk.on?.('trackEnd', handleHighlightsTrackEnd);
  sdk.on?.('play', handleHighlightsPlay);
  sdk.on?.('pause', handleHighlightsPause);
  sdk.on?.('share', handleHighlightsShare);
  sdk.on?.('pageView', handleHighlightsPageView);
}

/**
 * Unregister all highlights player callbacks
 * Call this when unmounting or cleaning up
 */
export function unregisterHighlightsPlayerCallbacks(
  sdk: Pick<HighlightsSDK, 'off'> | null | undefined,
) {
  if (!sdk) return;

  sdk.off?.('streamStart', handleHighlightsStreamStart);
  sdk.off?.('streamEnd', handleHighlightsStreamEnd);
  sdk.off?.('trackStart', handleHighlightsTrackStart);
  sdk.off?.('trackEnd', handleHighlightsTrackEnd);
  sdk.off?.('play', handleHighlightsPlay);
  sdk.off?.('pause', handleHighlightsPause);
  sdk.off?.('share', handleHighlightsShare);
  sdk.off?.('pageView', handleHighlightsPageView);
}
