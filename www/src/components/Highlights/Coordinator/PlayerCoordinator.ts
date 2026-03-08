import { HighlightsAnalytics } from '../HighlightsAnalytics';
import { navigate } from 'state/Routing/actions';

import { ActionsHandler } from './ActionsHandler';
import { FollowStatusService } from './FollowStatusService';
import { SdkLoader } from './SdkLoader';
import { StateManager } from './StateManager';

import type {
  AnalyticsContext,
  CheckFollowPayloadType,
  EventHandlers,
  FollowPayloadType,
  HighlightsPlayerState,
  InitOptions,
  MiniPlayerActions,
  MuteChangeParamsType,
  OnExpandViewChangedPayloadType,
  PlayChangeIHeartContentPayload,
  PlayerStateHook,
  PlayPauseChangeParamsType,
  ReduxDispatch,
  SharePayloadType,
  VideoNotFoundParamsType,
} from './types';
import type { State } from 'state/buildInitialState';

/**
 * Singleton coordinator for managing Mini Player and Highlights player interactions.
 *
 * The PlayerCoordinator ensures that audio (iHeartRadio Mini Player) and video (Highlights)
 * playback are properly synchronized to prevent both playing simultaneously. Key behaviors:
 *
 * ## Core Coordination Rules:
 * 1. **Mini Player playing + Highlights muted** → No change (both can coexist)
 * 2. **Mini Player playing + Highlights unmuted + Highlights playing** → Pause Mini Player to prevent overlap
 * 3. **Highlights player pause** → Revert Mini Player state (if paused for Highlights, resume; if was paused, stay paused)
 * 4. **Highlights player mute** → Revert Mini Player state (if paused for Highlights, resume; if was paused, stay paused)
 * 5. **Mini Player play when Highlights paused+unmuted** → No Highlights mute change (preserve pause state)
 * 6. **Mini Player playing + Highlights unmuted + Highlights paused** → No change (no audio overlap since Highlights is paused)
 *
 * ## Special Rules:
 * - Unmuting a Highlights player only pauses Mini Player if Highlights player is actually playing
 * - Clicking play on a muted Highlights player does NOT pause current Mini Player
 * - Mute state persistence carries over between different contexts
 * - Page refresh resets coordination state to defaults
 *
 * This creates a seamless user experience where only one media source plays audio at a time.
 */
class PlayerCoordinator {
  private static instance: PlayerCoordinator;

  private stateManager: StateManager;

  private sdkLoader: SdkLoader;

  private actionsHandler: ActionsHandler;

  private followStatusService: FollowStatusService;

  private eventHandlers: EventHandlers;

  private onVideoNotFoundCallback?: () => void;

  private onFeedLoadedCallback?: () => void;

  private onShareCallback?: (
    shareUrl: string,
    metadata?: {
      type?: string;
      id?: string;
      clipDescription?: string;
      clipTitle?: string;
      clipThumbnailUrl?: string;
    },
  ) => void;

  /** Analytics instance for tracking highlights events */
  private analytics: HighlightsAnalytics;

  /** Context for analytics (stationId, podcastId, etc.) */
  private analyticsContext?: AnalyticsContext;

  private reduxGetState?: () => State;

  private reduxDispatch?: ReduxDispatch;

  private playContentCallback?: (options: {
    type: 'podcast' | 'episode' | 'station';
    podcastId?: string | number;
    episodeId?: string | number;
    stationId?: string | number;
    playerState?: PlayerStateHook;
  }) => void;

  private constructor() {
    this.stateManager = new StateManager();
    this.sdkLoader = new SdkLoader();
    this.actionsHandler = new ActionsHandler();
    this.actionsHandler.setStateManager(this.stateManager);
    this.followStatusService = new FollowStatusService();
    this.eventHandlers = {};
    this.analytics = new HighlightsAnalytics();
  }

  /** Returns the singleton instance of PlayerCoordinator */
  public static getInstance(): PlayerCoordinator {
    if (!PlayerCoordinator.instance) {
      PlayerCoordinator.instance = new PlayerCoordinator();
    }
    return PlayerCoordinator.instance;
  }

  /** Returns a readonly copy of current state for external access */
  public getState(): Readonly<HighlightsPlayerState> {
    return this.stateManager.getState();
  }

  /** Sets the player actions from usePlayerActions hook */
  public setPlayerActions(playerActions: MiniPlayerActions): void {
    this.stateManager.setPlayerActions(playerActions);
  }

  /** Sets the callback function for playing mini player content */
  public setPlayContentCallback(
    callback: (options: {
      type: 'podcast' | 'episode' | 'station';
      podcastId?: string | number;
      episodeId?: string | number;
      stationId?: string | number;
      playerState?: PlayerStateHook;
    }) => void,
  ): void {
    this.playContentCallback = callback;
  }

  /** Sets the Redux dispatch function for opening modals and handling actions */
  public setDispatch(dispatch: ReduxDispatch): void {
    this.reduxDispatch = dispatch;
    this.sdkLoader.setDispatch(dispatch);
    this.actionsHandler.setDispatch(dispatch);

    // Configure follow status service with dispatch and getState if available
    if (this.reduxGetState) {
      this.followStatusService.setConfig({
        dispatch,
        getState: this.reduxGetState,
      });
    }
  }

  /**
   * Sets the Redux getState function for accessing store state
   * This allows the coordinator to read Redux state outside of React components
   * Also configures the follow status service with dispatch and getState
   */
  public setReduxGetState(getState: () => State): void {
    this.reduxGetState = getState;

    // Configure follow status service if dispatch is already set
    if (this.reduxDispatch) {
      this.followStatusService.setConfig({
        dispatch: this.reduxDispatch,
        getState,
      });
    }
  }

  /** Sets the player state from usePlayerState hook */
  public setPlayerState(playerStateHook: PlayerStateHook): void {
    this.stateManager.setPlayerState(playerStateHook);
  }

  /** Handles Highlights player play event - implements coordination rules */
  private handleVideoPlay = (payload: PlayPauseChangeParamsType): void => {
    this.stateManager.set('isHighlightsPlayerPlaying', true);

    if (
      !payload.payload.muted &&
      this.stateManager.get('isMiniPlayerPlaying')
    ) {
      this.stateManager.set('miniPlayerShouldPlayAgain', true);
      this.stateManager.set('miniPlayerPausedByCoordination', true);
      this.stateManager.pauseMiniPlayer();
    }
  };

  /**
   * Handles Highlights player pause event - implements coordination rules.
   */
  private handleVideoPause = (payload: PlayPauseChangeParamsType): void => {
    this.stateManager.set('isHighlightsPlayerPlaying', false);

    if (
      !payload.payload.muted &&
      this.stateManager.get('miniPlayerShouldPlayAgain')
    ) {
      this.stateManager.set('miniPlayerShouldPlayAgain', false);

      if (!this.stateManager.get('expandViewOpen')) {
        this.stateManager.set('miniPlayerPausedByCoordination', false);
      }

      this.stateManager.set('bypassMuteCall', true);
      this.stateManager.playMiniPlayer();
    }
  };

  /**
   * Handles expand view state changes from the Highlights player.
   */
  private onExpandViewChanged = (
    payload: OnExpandViewChangedPayloadType,
  ): void => {
    const isOpening = payload.payload;

    if (isOpening) {
      this.stateManager.set(
        'miniPlayerWasPlayingBeforeExpand',
        this.stateManager.get('isMiniPlayerPlaying'),
      );

      if (
        this.stateManager.get('isHighlightsPlayerMuted') &&
        this.stateManager.get('isMiniPlayerPlaying')
      ) {
        this.stateManager.pauseMiniPlayer();
      }
    } else {
      this.stateManager.set('expandViewOpen', false);

      const highlightsNotPlayingAudio = !this.stateManager.get(
        'isHighlightsPlayerPlaying',
      );

      const shouldResumeMiniPlayer =
        highlightsNotPlayingAudio &&
        (this.stateManager.get('miniPlayerWasPlayingBeforeExpand') ||
          this.stateManager.get('miniPlayerPausedByCoordination')) &&
        !this.stateManager.get('isMiniPlayerPlaying');

      if (shouldResumeMiniPlayer) {
        this.stateManager.playMiniPlayer();
        this.stateManager.set('miniPlayerPausedByCoordination', false);
      }

      this.stateManager.set('miniPlayerWasPlayingBeforeExpand', false);
      return;
    }

    this.stateManager.set('expandViewOpen', isOpening);
  };

  /**
   * Handles video not found events from Highlights SDK.
   */
  private handleVideoNotFound = (_payload: VideoNotFoundParamsType): void => {
    if (this.onVideoNotFoundCallback) {
      this.onVideoNotFoundCallback();
    }
  };

  /**
   * Handles Highlights player mute state changes and coordinates with Mini Player.
   */
  private handleVideoMuteChange = (
    payloadParam: MuteChangeParamsType,
  ): void => {
    const payload = payloadParam?.payload;

    if (typeof payload.muted === 'boolean') {
      this.stateManager.set('isHighlightsPlayerMuted', payload.muted);
      this.stateManager.set('lastHighlightsMuteState', payload.muted);

      if (this.stateManager.get('ignoreMuteChangeEvent')) {
        this.stateManager.set('ignoreMuteChangeEvent', false);
        return;
      }

      if (payload.muted && this.stateManager.get('miniPlayerShouldPlayAgain')) {
        this.stateManager.set('miniPlayerShouldPlayAgain', false);

        if (!this.stateManager.get('expandViewOpen')) {
          this.stateManager.set('miniPlayerPausedByCoordination', false);
        }

        this.stateManager.playMiniPlayer();
      } else if (
        !payload.muted &&
        this.stateManager.get('isHighlightsPlayerPlaying') &&
        this.stateManager.get('isMiniPlayerPlaying')
      ) {
        this.stateManager.set('miniPlayerShouldPlayAgain', true);
        this.stateManager.set('miniPlayerPausedByCoordination', true);
        this.stateManager.pauseMiniPlayer();
      }
    }
  };

  /**
   * Handles feed loaded event from Highlights SDK.
   */
  private handleFeedLoaded = (): void => {
    if (this.onFeedLoadedCallback) {
      this.onFeedLoadedCallback();
    }
  };

  /**
   * Handles follow/unfollow events from Highlights SDK.
   */
  private handleFollowChanged = (payload: FollowPayloadType): void => {
    this.actionsHandler.handleFollow(payload);
  };

  /**
   * Handles play/pause requests for iHeartRadio content from Highlights SDK.
   *
   * This method processes requests from the Highlights player to play or pause
   * iHeartRadio content (stations or podcasts) in the Mini Player.
   *
   * Flow:
   * 1. Extracts play action and content type from payload
   * 2. Routes to appropriate handler based on content type (station vs podcast)
   * 3. For stations: plays or pauses the station directly
   * 4. For podcasts:
   *    - With episodeId: plays/pauses specific episode
   *    - Without episodeId: navigates to podcast page (if on station page) or scrolls to top
   * 5. Navigation to podcast page occurs when user is on a station page (indicated by analyticsContext.stationId)
   *
   * @param payload - Contains play action, content type, and identifiers (stationId, podcastId, episodeId, slug)
   */
  private handlePlayIHeartContent = (
    payload: PlayChangeIHeartContentPayload,
  ): void => {
    const contentPayload = payload.payload;
    const { play, type, videoId, videoTitle } = contentPayload;

    // Track manual video click analytics when user plays a video
    if (play && videoId) {
      this.analytics.trackManualVideoClick(
        videoId,
        play,
        videoTitle || '',
        this.stateManager.get('expandViewOpen'),
      );
    }

    // Early return if no callback is configured
    if (!this.playContentCallback) return;

    // Handle station play/pause requests
    if (type === 'station' && contentPayload.stationId) {
      if (play) {
        this.playContentCallback({
          type: 'station',
          stationId: contentPayload.stationId,
          playerState: this.stateManager.get('playerStateHook'),
        });
      } else {
        this.stateManager.pauseMiniPlayer();
      }
      return;
    }

    // Handle podcast play/pause requests
    if (type === 'podcast' && contentPayload.podcastId) {
      // Pause action - always just pause the mini player
      if (!play) {
        this.stateManager.pauseMiniPlayer();
        return;
      }

      // Play action - handle navigation and playback
      const shouldNavigateToPodcast =
        this.analyticsContext?.stationId &&
        (!contentPayload.episodeId || this.stateManager.get('expandViewOpen'));

      if (shouldNavigateToPodcast) {
        this.navigateToPodcastPage(
          contentPayload.slug || String(contentPayload.podcastId),
        );
      }

      // Play specific episode if episodeId provided
      if (contentPayload.episodeId) {
        this.playContentCallback({
          type: 'episode',
          podcastId: contentPayload.podcastId,
          episodeId: contentPayload.episodeId,
          playerState: this.stateManager.get('playerStateHook'),
        });
      } else {
        // No episode ID - scroll to top to show podcast details
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  /**
   * Handles share events from Highlights SDK.
   * Calls the share callback with the provided share payload.
   */
  private handleShare = (payload: SharePayloadType): void => {
    if (this.onShareCallback) {
      const {
        shareUrl,
        type,
        id,
        clipDescription,
        clipTitle,
        clipThumbnailUrl,
      } = payload.payload;
      this.onShareCallback(shareUrl, {
        type,
        id,
        clipDescription,
        clipTitle,
        clipThumbnailUrl,
      });
    }
  };

  /**
   * Navigates to a podcast page using Redux navigation or falls back to window.location
   */
  private navigateToPodcastPage(slug: string): void {
    const podcastPath = `/podcast/${slug}`;

    if (this.reduxDispatch) {
      this.reduxDispatch(navigate({ path: podcastPath }));
    } else {
      window.location.href = podcastPath;
    }
  }

  /**
   * Registers event listeners for Highlights video player events.
   */
  private attachEventListeners(): void {
    if (window.genuin) {
      this.eventHandlers.onPlay = this.handleVideoPlay;
      this.eventHandlers.onPause = this.handleVideoPause;
      this.eventHandlers.onMuteChange = this.handleVideoMuteChange;
      this.eventHandlers.onVideoNotFound = this.handleVideoNotFound;
      this.eventHandlers.onExpandViewChanged = this.onExpandViewChanged;
      this.eventHandlers.onFeedLoaded = this.handleFeedLoaded;
      this.eventHandlers.onFollowChanged = this.handleFollowChanged;
      this.eventHandlers.checkFollowingStatus = this.getFollowStateByTypeAndId;
      this.eventHandlers.playIHeartContent = this.handlePlayIHeartContent;
      this.eventHandlers.onShare = this.handleShare;

      window.genuin.on<PlayPauseChangeParamsType>(
        'onPlay',
        this.eventHandlers.onPlay,
      );
      window.genuin.on<PlayPauseChangeParamsType>(
        'onPause',
        this.eventHandlers.onPause,
      );
      window.genuin.on<MuteChangeParamsType>(
        'onMuteChange',
        this.eventHandlers.onMuteChange,
      );
      window.genuin.on<VideoNotFoundParamsType>(
        'onVideoNotFound',
        this.eventHandlers.onVideoNotFound,
      );
      window.genuin.on<OnExpandViewChangedPayloadType>(
        'onExpandViewChanged',
        this.eventHandlers.onExpandViewChanged,
      );
      window.genuin.on('onFeedLoaded', this.eventHandlers.onFeedLoaded);
      window.genuin.on<FollowPayloadType>(
        'onFollowChanged',
        this.eventHandlers.onFollowChanged,
      );
      window.genuin.on<CheckFollowPayloadType>(
        'checkFollowingStatus',
        this.eventHandlers.checkFollowingStatus,
      );
      if (this.eventHandlers.playIHeartContent) {
        window.genuin.on<PlayChangeIHeartContentPayload>(
          'playIHeartContent',
          this.eventHandlers.playIHeartContent,
        );
      }
      window.genuin.on<SharePayloadType>('onShare', this.eventHandlers.onShare);
    }
  }

  /**
   * Removes all Highlights event listeners and clears handler references.
   */
  private detachHighlightsEventListeners(): void {
    if (window.genuin && this.eventHandlers) {
      if (this.eventHandlers.onPlay) {
        window.genuin.off<PlayPauseChangeParamsType>(
          'onPlay',
          this.eventHandlers.onPlay,
        );
      }
      if (this.eventHandlers.onPause) {
        window.genuin.off<PlayPauseChangeParamsType>(
          'onPause',
          this.eventHandlers.onPause,
        );
      }
      if (this.eventHandlers.onMuteChange) {
        window.genuin.off<MuteChangeParamsType>(
          'onMuteChange',
          this.eventHandlers.onMuteChange,
        );
      }
      if (this.eventHandlers.onVideoNotFound) {
        window.genuin.off<VideoNotFoundParamsType>(
          'onVideoNotFound',
          this.eventHandlers.onVideoNotFound,
        );
      }
      if (this.eventHandlers.onExpandViewChanged) {
        window.genuin.off<OnExpandViewChangedPayloadType>(
          'onExpandViewChanged',
          this.eventHandlers.onExpandViewChanged,
        );
      }
      if (this.eventHandlers.onFeedLoaded) {
        window.genuin.off('onFeedLoaded', this.eventHandlers.onFeedLoaded);
      }
      if (this.eventHandlers.onFollowChanged) {
        window.genuin.off<FollowPayloadType>(
          'onFollowChanged',
          this.eventHandlers.onFollowChanged,
        );
      }
      if (this.eventHandlers.checkFollowingStatus) {
        window.genuin.off<CheckFollowPayloadType>(
          'checkFollowingStatus',
          this.eventHandlers.checkFollowingStatus,
        );
      }
      if (this.eventHandlers.onShare) {
        window.genuin.off<SharePayloadType>(
          'onShare',
          this.eventHandlers.onShare,
        );
      }

      if (this.eventHandlers.playIHeartContent) {
        window.genuin.off<PlayChangeIHeartContentPayload>(
          'playIHeartContent',
          this.eventHandlers.playIHeartContent,
        );
      }

      this.eventHandlers = {};
    }
  }

  /**
   * Sets a callback to be invoked when video not found event occurs.
   */
  public setOnVideoNotFoundCallback(callback: () => void): void {
    this.onVideoNotFoundCallback = callback;
  }

  /**
   * Sets a callback to be invoked when the highlights feed is loaded.
   */
  public setOnFeedLoadedCallback(callback: () => void): void {
    this.onFeedLoadedCallback = callback;
  }

  /**
   * Sets a callback to be invoked when share event occurs.
   */
  public setOnShareCallback(
    callback: (
      shareUrl: string,
      metadata?: {
        type?: string;
        id?: string;
        clipDescription?: string;
        clipTitle?: string;
        clipThumbnailUrl?: string;
      },
    ) => void,
  ): void {
    this.onShareCallback = callback;
  }

  /**
   * Checks if the player coordination is properly set up with both hooks
   */
  public isCoordinationReady(): boolean {
    const state = this.stateManager.getState();
    return !!(state.playerActions && state.playerStateHook);
  }

  /**
   * Gets current player coordination status for debugging
   */
  public getCoordinationStatus() {
    const state = this.stateManager.getState();
    const audioState = state.playerStateHook?.playbackState || 'UNKNOWN';
    const isAudioPlaying = audioState === 'PLAYING';

    return {
      isReady: this.isCoordinationReady(),
      audioState,
      audioActuallyPlaying: isAudioPlaying,
      videoMuted: state.isHighlightsPlayerMuted,
      videoPlaying: state.isHighlightsPlayerPlaying,
      miniPlayerPlaying: state.isMiniPlayerPlaying,
      coordinationActive: isAudioPlaying && state.isHighlightsPlayerMuted,
      flags: {
        miniPlayerShouldPlayAgain: state.miniPlayerShouldPlayAgain,
        highlightsPlayerShouldUnmuteAgain:
          state.highlightsPlayerShouldUnmuteAgain,
        ignoreMuteChangeEvent: state.ignoreMuteChangeEvent,
        bypassMuteCall: state.bypassMuteCall,
        miniPlayerWasPlayingBeforeExpand:
          state.miniPlayerWasPlayingBeforeExpand,
        miniPlayerPausedByCoordination: state.miniPlayerPausedByCoordination,
      },
      stationType: state.playerStateHook?.stationType,
      isPodcast: state.isPodcast,
      isInitialized: state.isInitialized,
      lastStateTransition: {
        from: audioState,
        coordinationTriggered:
          state.highlightsPlayerShouldUnmuteAgain ||
          state.miniPlayerShouldPlayAgain,
      },
      muteStatePersistence: {
        lastHighlightsMuteState: state.lastHighlightsMuteState,
        currentHighlightsMuteState: state.isHighlightsPlayerMuted,
        muteStateWillPersist:
          state.lastHighlightsMuteState === state.isHighlightsPlayerMuted,
      },
      playbackContext: {
        isManualHighlightsPlayback: state.isManualHighlightsPlayback,
        coordinationMode:
          state.isManualHighlightsPlayback ? 'manual_highlights' : (
            'auto_coordination'
          ),
      },
      expandViewState: {
        isOpen: state.expandViewOpen,
        miniPlayerWasPlayingBeforeExpand:
          state.miniPlayerWasPlayingBeforeExpand,
        shouldControlMiniPlayer:
          this.stateManager.shouldPerformActionOnMiniPlayer(),
        miniPlayerPausedByCoordination: state.miniPlayerPausedByCoordination,
      },
    };
  }

  /**
   * Single entry point to initialize the entire Highlights SDK integration.
   */
  public init(options?: InitOptions, isPodcast: boolean = false): void {
    const defaultScriptUrl = `https://media.begenuin.com/sdk/2.0.2-phase-2-fixes/gen_sdk.min.js`;
    const scriptUrl = options?.scriptUrl || defaultScriptUrl;

    // Store analytics context
    this.analyticsContext = {
      stationId: options?.stationId,
      stationName: options?.stationName,
      podcastId: options?.podcastId,
      podcastName: options?.podcastName,
      sessionId: options?.sessionId,
    };

    // Store brand context in state for later access
    if (options?.config?.brand_context) {
      this.stateManager.set('brandContext', options.config.brand_context);
    }

    this.stateManager.set('isPodcast', isPodcast);

    this.sdkLoader.setupAuthenticationCallback();
    this.sdkLoader.setupDNSOptimization();

    this.sdkLoader.loadScript(scriptUrl, () => {
      this.sdkLoader.initialize(options?.config, () => {
        this.attachEventListeners();
        this.stateManager.set('isInitialized', true);
      });

      // Initialize analytics
      this.analytics.initialize(this.analyticsContext);
    });
  }

  /**
   * Sets up coordination for audio player events.
   */
  public setupAudioPlayerSubscription(): (() => void) | undefined {
    const state = this.stateManager.getState();
    if (state.playerActions && state.playerStateHook) {
      this.performInitialCoordination();

      return () => {
        this.stateManager.set('miniPlayerShouldPlayAgain', false);
        this.stateManager.set('highlightsPlayerShouldUnmuteAgain', false);
      };
    }

    return undefined;
  }

  /**
   * Performs initial coordination setup based on current player states
   */
  private performInitialCoordination(): void {
    const state = this.stateManager.getState();
    if (!state.playerStateHook) return;

    const audioIsPlaying = state.playerStateHook.playbackState === 'PLAYING';
    const highlightsIsUnmuted = !state.isHighlightsPlayerMuted;
    const highlightsIsPlaying = state.isHighlightsPlayerPlaying;

    if (audioIsPlaying && highlightsIsUnmuted && highlightsIsPlaying) {
      this.stateManager.set('highlightsPlayerShouldUnmuteAgain', true);
      this.stateManager.muteHighlightsPlayer();
    }
  }

  /**
   * Handles highlights player unmute action.
   */
  public handleHighlightsUnmute(): void {
    this.stateManager.unmuteHighlightsPlayer();

    if (this.stateManager.get('isMiniPlayerPlaying')) {
      this.stateManager.set('miniPlayerShouldPlayAgain', true);
      this.stateManager.pauseMiniPlayer();
    }
  }

  /**
   * Gets the preserved mute state for restoration
   */
  public getPreservedMuteState(): boolean {
    return this.stateManager.get('lastHighlightsMuteState');
  }

  /**
   * Sets the preserved mute state
   */
  public setPreservedMuteState(muted: boolean): void {
    this.stateManager.set('lastHighlightsMuteState', muted);
  }

  /**
   * Updates follow state to the highlights SDK and internal state
   */
  public updateFollowState(followed: boolean): void {
    const brandContext = this.stateManager.get('brandContext');
    if (brandContext && brandContext.length > 0) {
      const { id, type } = brandContext[0];
      const followActionPayload: FollowPayloadType = {
        payload: {
          isFollowed: followed,
          id,
          type,
          name: '',
        },
        timestamp: Date.now(),
        type: 'onFollowChanged',
      };
      this.stateManager.updateFollowState(followActionPayload);
      this.stateManager.set('brandContext', [{ ...brandContext[0] }]);
    }
  }

  /**
   * Gets the analytics context (station/podcast information)
   * Used for triggering analytics events with proper context
   */
  public getAnalyticsContext(): AnalyticsContext | undefined {
    return this.analyticsContext;
  }

  /**
   * Gets the follow/favorite state for a given podcast or station
   * Called by the Highlights SDK to check if content is followed
   *
   * This method fetches the status directly from the API rather than relying
   * on the Redux store, ensuring accurate results even for content not yet loaded.
   *
   * Note: This is a synchronous callback expected by the Highlights SDK, but we need
   * async API calls. The method initiates the API call and returns a cached/default value
   * immediately, then updates the SDK when the API responds.
   */
  public getFollowStateByTypeAndId = (
    payload: CheckFollowPayloadType,
  ): boolean => {
    const {
      payload: { id, type },
    } = payload;

    // Initiate async fetch (fire and forget - result will be cached for next time)
    const contentType = type === 'podcast' ? 'podcast' : 'station';
    this.followStatusService
      .getFollowStatus(id, contentType)
      .then(isFollowed => {
        this.stateManager.updateFollowState({
          payload: {
            isFollowed,
            id,
            type,
            name: '',
          },
          timestamp: Date.now(),
          type: 'onFollowChanged',
        });
      })
      .catch(() => {
        // Silently fail - will use default false
      });

    // Return false as default (will be updated via emit once API responds)
    // This is a limitation of the synchronous SDK callback interface
    return false;
  };

  /**
   * Resets coordinator to initial state and removes all event listeners.
   */
  public cleanup(): void {
    this.detachHighlightsEventListeners();
    this.analytics.destroy();
    this.sdkLoader.cleanup();
    this.actionsHandler.cleanup();
    this.sdkLoader.reset();
    this.stateManager.reset();
    this.eventHandlers = {};
    this.reduxGetState = undefined;
    this.reduxDispatch = undefined;
    window.genuin?.destroy();
  }
}

// Export singleton instance for use across the application
export const playerCoordinator = PlayerCoordinator.getInstance();
