import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import {
  handleHighlightsClick,
  handleHighlightsPageView,
  handleHighlightsPause,
  handleHighlightsPlay,
  handleHighlightsShare,
  handleHighlightsStreamEnd,
  handleHighlightsStreamStart,
  handleHighlightsTrackEnd,
  handleHighlightsTrackStart,
} from './HighlightsPlayerActions/shims';
import type {
  HighlightsCTAClickData,
  HighlightsPageViewData,
  HighlightsPauseData,
  HighlightsPlayData,
  HighlightsShareData,
  HighlightsStreamEndData,
  HighlightsStreamStartData,
  HighlightsTrackEndData,
  HighlightsTrackStartData,
} from './HighlightsPlayerActions/types';

/**
 * Analytics event names from the Highlights SDK that we track
 */
export const HighlightsEventName = {
  VIDEO_STARTED: 'Video Started',
  VIDEO_COMPLETED: 'Video Complete',
  VIDEO_PAUSED: 'Video Paused',
  VIDEO_SHARED: 'Video Shared',
  VIDEO_PLAY: 'Video Play',
} as const;

/**
 * Analytics event payload from the Highlights SDK
 */
interface AnalyticsEventPayload {
  payload: {
    eventName: string;
    eventPayload?: Record<string, unknown>;
  };
  timestamp?: number;
  [key: string]: unknown;
}

/**
 * Event payload when video player mute state changes
 */
interface MuteChangeParamsType {
  payload: {
    muted: boolean;
    volume: number;
  };
  timestamp: number;
  type: string;
}

/**
 * Context information for analytics events
 */
interface AnalyticsContext {
  stationId?: number;
  stationName?: string;
  podcastId?: number;
  podcastName?: string;
  sessionId?: string;
}

/**
 * HighlightsAnalytics class handles tracking of analytics events from the Highlights SDK.
 *
 * The class listens to analytics and player events from window.genuin and processes
 * analytics events for highlights video player interactions.
 *
 * This class is independent and maintains its own state (like mute state) without
 * relying on PlayerCoordinator.
 *
 * Instance is managed by PlayerCoordinator - initialized when SDK loads and destroyed on cleanup.
 *
 * @example
 * ```ts
 * const analytics = new HighlightsAnalytics();
 * analytics.initialize({
 *   stationId: 123,
 *   stationName: 'My Station',
 * });
 *
 * // Later, when cleaning up
 * analytics.destroy();
 * ```
 */
export class HighlightsAnalytics {
  private isInitialized: boolean = false;

  private analyticsHandler?: (payload: AnalyticsEventPayload) => void;

  private onMuteChangeHandler?: (payload: MuteChangeParamsType) => void;

  /**
   * Tracks the current mute state of the Highlights player.
   * This allows analytics to be aware of player state without depending on PlayerCoordinator.
   */
  private isMuted: boolean = true; // Default to muted state

  /**
   * Context information (station/podcast) for analytics events
   */
  private context: AnalyticsContext = {};

  /**
   * Timestamp when the highlights session started
   */
  private sessionStartTime: number = 0;

  /**
   * Flag to track if stream start event has been fired.
   * Stream start should only be called once when the first clip starts playing.
   */
  private hasStreamStarted: boolean = false;

  /**
   * Track the last known stream feed position for stream end event
   */
  private lastStreamFeedPosition: number = 1;

  /**
   * Track the stream feed total from the first video (stream start).
   * This value is set once during stream start and used for stream end.
   */
  private streamFeedTotal: number = 0;

  /**
   * Generates the asset ID in the format "podcast|{id}" or "live|{id}"
   * based on the current context.
   *
   * @returns Formatted asset ID string
   */
  private getAssetId(): string {
    if (this.context.podcastId) {
      return `podcast|${this.context.podcastId}`;
    }
    if (this.context.stationId) {
      return `live|${this.context.stationId}`;
    }
    return '';
  }

  /**
   * Builds the asset object with context information for analytics events.
   *
   * @param subId - Optional sub-asset ID (e.g., content_id from video payload)
   * @param subName - Optional sub-asset name (e.g., video title from payload)
   * @returns Asset object with main and sub-asset information
   */
  private buildAsset(subId = '', subName = '') {
    return {
      id: subId,
      name: subName,
      sub: {
        id: this.getAssetId(),
        name: this.context.podcastName || this.context.stationName || '',
      },
      type: 'highlights' as const,
    };
  }

  /**
   * Builds common station data structure for track events
   *
   * @param contentId - Content ID from video payload
   * @param title - Title from video payload
   * @returns Station data with asset and session info
   */
  private buildStationData(contentId = '', title = '') {
    const baseData = {
      asset: this.buildAsset(contentId, title),
      offlineEnabled: 'No Value',
      playbackStartTime: this.sessionStartTime,
      playedFrom: PLAYED_FROM.HIGHLIGHTS,
      startPosition: 0,
    };

    return this.context.sessionId ?
        { ...baseData, sessionId: this.context.sessionId }
      : baseData;
  }

  /**
   * Builds the stream start data structure with context
   *
   * @param streamFeedPosition - Position in the feed (position_index + 1)
   * @param streamFeedTotal - Total videos in the feed
   * @param isAutoplay - Whether the stream started via autoplay
   */
  private buildStreamStartData(
    streamFeedPosition: number,
    streamFeedTotal: number,
    isAutoplay: boolean,
    contentId = '',
    title = '',
  ): HighlightsStreamStartData {
    return {
      station: {
        ...this.buildStationData(contentId, title),
        playbackStartTime: Date.now(),
      },
      streamFeedPosition,
      streamFeedTotal,
      streamIsMute: this.isMuted,
      isAutoplay,
      event: {
        location: '',
      },
    };
  }

  /**
   * Builds the stream end data structure with context
   *
   * @param streamFeedPosition - Position in the feed (position_index + 1)
   * @param streamFeedTotal - Total videos in the feed
   */
  private buildStreamEndData(
    streamFeedPosition: number,
    streamFeedTotal: number,
  ): HighlightsStreamEndData {
    const listenTime =
      this.sessionStartTime > 0 ?
        Math.floor((Date.now() - this.sessionStartTime) / 1000)
      : 0;

    return {
      station: {
        ...this.buildStationData(),
        endReason: 'navigation',
        listenTime,
      },
      streamFeedPosition,
      streamFeedTotal,
      streamIsMute: this.isMuted,
    };
  }

  /**
   * Handles mute change events from the Highlights SDK.
   * Updates internal mute state and tracks analytics with full context.
   *
   * @param payload - Mute change event payload from Highlights SDK
   */
  private handleMuteChangeEvent = (payload: MuteChangeParamsType): void => {
    this.isMuted = payload.payload.muted;

    // Mute change doesn't trigger a specific analytics event,
    // but it affects the state included in other events
  };

  /**
   * Handles analytics events from the Highlights SDK.
   * Only processes whitelisted events: Video Started, Video Complete, Video Paused, Video Shared, Video Play.
   *
   * @param _payload - Analytics event payload from Highlights SDK
   */
  private handleAnalyticsEvent = (_payload: AnalyticsEventPayload): void => {
    const { eventName, eventPayload } = _payload.payload;

    // Get the list of valid event names to track
    const validEvents = Object.values(HighlightsEventName);

    // Filter: only process whitelisted events
    if (
      !validEvents.includes(
        eventName as (typeof HighlightsEventName)[keyof typeof HighlightsEventName],
      )
    ) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = eventPayload as any;

    // Handle different event types and trigger appropriate iHR analytics events
    switch (eventName) {
      case HighlightsEventName.VIDEO_STARTED: {
        const streamFeedPosition = (payload?.position_index ?? 0) + 1 || 1;
        const streamFeedTotal = payload?.total_videos || 0;
        const isAutoplay = payload?.autoplay || false;

        // Update last known feed position
        this.lastStreamFeedPosition = streamFeedPosition;

        // Trigger stream_start event only on first video started
        if (!this.hasStreamStarted) {
          this.hasStreamStarted = true;
          this.sessionStartTime = Date.now();

          // Set streamFeedTotal only once during stream start
          this.streamFeedTotal = streamFeedTotal;

          const streamStartData = this.buildStreamStartData(
            streamFeedPosition,
            this.streamFeedTotal,
            isAutoplay,
            payload?.content_id || '',
            payload?.title || '',
          );
          handleHighlightsStreamStart(streamStartData);
        }

        // Trigger track_start for each video
        const trackStartData: HighlightsTrackStartData = {
          station: this.buildStationData(
            payload?.content_id || '',
            payload?.title || '',
          ),
          streamFeedPosition,
          streamFeedTotal,
          streamIsMute: this.isMuted,
          isAutoplay,
        };

        handleHighlightsTrackStart(trackStartData);

        // If user clicked to start (not autoplay), also trigger play event
        if (payload?.by_user === true) {
          const stationBase = {
            asset: this.buildAsset(
              payload?.content_id || '',
              payload?.title || '',
            ),
            playedFrom: PLAYED_FROM.HIGHLIGHTS,
          };

          const playData: HighlightsPlayData = {
            station:
              this.context.sessionId ?
                { ...stationBase, sessionId: this.context.sessionId }
              : stationBase,
          };

          handleHighlightsPlay(playData);
        }
        break;
      }

      case HighlightsEventName.VIDEO_COMPLETED: {
        const streamFeedPosition = (payload?.position_index ?? 0) + 1 || 1;
        const streamFeedTotal = payload?.total_videos || 0;

        // Update last known feed position
        this.lastStreamFeedPosition = streamFeedPosition;

        // Trigger track_end when video completes
        const completionRate =
          payload?.video_view_length && payload?.video_length ?
            payload.video_view_length / payload.video_length
          : 0;

        const trackEndData: HighlightsTrackEndData = {
          station: {
            ...this.buildStationData(
              payload?.content_id || '',
              payload?.title || '',
            ),
            endReason: 'next_clip_start',
            listenTime: payload?.video_view_length || 0,
            completionRate,
          },
          streamFeedPosition,
          streamFeedTotal,
          streamIsMute: this.isMuted,
          isAutoplay: payload?.autoplay || false,
        };

        handleHighlightsTrackEnd(trackEndData);

        break;
      }

      case HighlightsEventName.VIDEO_PAUSED: {
        // Trigger pause event
        const stationBase = {
          asset: this.buildAsset(
            payload?.content_id || '',
            payload?.title || '',
          ),
        };

        const pauseData: HighlightsPauseData = {
          station:
            this.context.sessionId ?
              { ...stationBase, sessionId: this.context.sessionId }
            : stationBase,
          event: {
            location: payload?.location || 'clip_feed', // TODO: Check payload.location
          },
        };

        handleHighlightsPause(pauseData);

        break;
      }

      case HighlightsEventName.VIDEO_PLAY: {
        // Trigger play event (resume from pause)
        const stationBase = {
          asset: this.buildAsset(
            payload?.content_id || '',
            payload?.title || '',
          ),
          playedFrom: PLAYED_FROM.HIGHLIGHTS,
        };

        const playData: HighlightsPlayData = {
          station:
            this.context.sessionId ?
              { ...stationBase, sessionId: this.context.sessionId }
            : stationBase,
        };

        handleHighlightsPlay(playData);

        break;
      }

      case HighlightsEventName.VIDEO_SHARED: {
        // Trigger share event
        const stationBase = {
          asset: this.buildAsset(
            payload?.content_id || '',
            payload?.title || '',
          ),
          playedFrom: PLAYED_FROM.HIGHLIGHTS,
          offlineEnabled: 'No Value',
        };

        const shareData: HighlightsShareData = {
          station:
            this.context.sessionId ?
              { ...stationBase, sessionId: this.context.sessionId }
            : stationBase,
          share: {
            platform: 'linkCopied',
          },
        };

        handleHighlightsShare(shareData);

        break;
      }

      default:
        break;
    }
  };

  /**
   * Initializes the analytics listener for Highlights SDK events.
   * Only initializes once - subsequent calls are ignored.
   *
   * Registers listeners for:
   * - onMuteChange: Track mute state changes and update internal state
   * - onAnalyticsTrack: Track custom analytics events from SDK
   *
   * @param context - Optional context information (station/podcast) for analytics events
   * @returns True if initialization was successful, false otherwise
   */
  public initialize(context?: AnalyticsContext): boolean {
    // Prevent double initialization
    if (this.isInitialized) {
      return false;
    }

    // Store context for analytics events
    if (context) {
      this.context = context;
    }

    // Ensure Highlights SDK is available
    if (!window.genuin) {
      return false;
    }

    // Store handler references for cleanup
    this.onMuteChangeHandler = this.handleMuteChangeEvent;
    this.analyticsHandler = this.handleAnalyticsEvent;

    // Attach player event listeners
    window.genuin.on<MuteChangeParamsType>(
      'onMuteChange',
      this.onMuteChangeHandler,
    );

    // Attach analytics event listener
    window.genuin.on<AnalyticsEventPayload>(
      'onAnalyticsTrack',
      this.analyticsHandler,
    );

    this.isInitialized = true;

    // Log page_view when highlights player is initialized
    let pageHost = '';
    let pageURL = '';
    if (__CLIENT__ && document.referrer) {
      const { host, href } = new URL(document.referrer);
      pageHost = host;
      pageURL = href;
    }

    const pageViewData: HighlightsPageViewData = {
      id: this.context.podcastId ? 'podcast|highlights' : 'live|highlights',
      name: 'Highlights',
      pageHost,
      pageName: this.context.podcastId ? 'podcast_profile' : 'live_profile',
      pageURL,
      subId: this.getAssetId(),
      subName: this.context.podcastName || this.context.stationName,
    };

    handleHighlightsPageView(pageViewData);
    return true;
  }

  /**
   * Removes all event listeners and cleans up resources.
   * Should be called during component unmount to prevent memory leaks.
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    // Trigger stream_end event before cleanup
    const streamEndData = this.buildStreamEndData(
      this.lastStreamFeedPosition,
      this.streamFeedTotal,
    );
    handleHighlightsStreamEnd(streamEndData);

    // Remove all event listeners if Highlights SDK is available
    if (window.genuin) {
      if (this.onMuteChangeHandler) {
        window.genuin.off<MuteChangeParamsType>(
          'onMuteChange',
          this.onMuteChangeHandler,
        );
      }
      if (this.analyticsHandler) {
        window.genuin.off<AnalyticsEventPayload>(
          'onAnalyticsTrack',
          this.analyticsHandler,
        );
      }
    }

    // Clear all handler references
    this.onMuteChangeHandler = undefined;
    this.analyticsHandler = undefined;

    // Reset state
    this.isMuted = true;
    this.isInitialized = false;
    this.sessionStartTime = 0;
    this.hasStreamStarted = false;
    this.lastStreamFeedPosition = 1;
    this.streamFeedTotal = 0;
    this.context = {};
  }

  /**
   * Returns whether the analytics listener is currently initialized
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Returns the current mute state of the Highlights player.
   * This is maintained independently from PlayerCoordinator.
   *
   * @returns True if muted, false if unmuted
   */
  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Returns the current state of the analytics system.
   * Useful for debugging and monitoring.
   */
  public getState() {
    return {
      isInitialized: this.isInitialized,
      isMuted: this.isMuted,
      context: this.context,
    };
  }

  /**
   * Tracks manual video click events from PlayerCoordinator.
   * This is called when a user manually clicks to play a Audio/Mini player from the Highlights player.
   *
   * Triggers two analytics events:
   * 1. Stream Start event - with the parent content (podcast/station) as the main asset
   * 2. Click event - with the video as the main asset and parent as sub-asset
   *
   * @param videoId - The ID of the video being played
   * @param videoTitle - The title of the video being played
   */
  public trackManualVideoClick(
    videoId: string,
    play: boolean,
    videoTitle: string,
    expandViewOpen: boolean,
  ): void {
    if (!this.isInitialized) {
      return;
    }
    // Determine location based on content type and player state
    const contentPrefix = this.context.podcastId ? 'podcast' : 'live';
    const playerSuffix = expandViewOpen ? 'highlight_fsp' : 'highlight_card';
    const location = `${contentPrefix}_profile_${playerSuffix}`;

    if (play) {
      // Event 1: Stream Start with parent content as main asset
      const streamStartData: HighlightsStreamStartData = {
        station: {
          asset: {
            id: this.getAssetId(),
            name: this.context.podcastName || this.context.stationName || '',
            sub: {
              id: videoId,
              name: videoTitle,
            },
            type: 'highlights' as const,
          },
          offlineEnabled: 'No Value',
          playbackStartTime: Date.now(),
          playedFrom: PLAYED_FROM.HIGHLIGHTS,
        },
        event: {
          location,
        },
      };

      handleHighlightsStreamStart(streamStartData);
    }

    // Event 2: Click event with video as main asset
    const clickEventData: HighlightsCTAClickData = {
      station: {
        asset: {
          id: this.getAssetId(),
          name: this.context.podcastName || this.context.stationName || '',
          sub: {
            id: videoId,
            name: videoTitle,
          },
          type: 'highlights' as const,
        },
      },
      event: {
        location,
      },
    };

    handleHighlightsClick(clickEventData);
  }
}
