import logger from 'modules/Logger';

import type {
  FollowPayloadType,
  HighlightsPlayerState,
  MiniPlayerActions,
  PlayerStateHook,
} from './types';

/**
 * Creates and manages the internal state for player coordination.
 * Provides methods to read and update state in a controlled manner.
 */
export class StateManager {
  private state: HighlightsPlayerState;

  private actions: MiniPlayerActions | null;

  constructor() {
    this.state = this.createInitialState();
    this.actions = null;
  }

  /**
   * Creates the initial state object with default values
   */
  private createInitialState(): HighlightsPlayerState {
    return {
      playerActions: null,
      playerStateHook: null,
      brandContext: null,
      miniPlayerShouldPlayAgain: false,
      highlightsPlayerShouldUnmuteAgain: false,
      isMiniPlayerPlaying: false,
      isHighlightsPlayerMuted: true,
      isHighlightsPlayerPlaying: false,
      ignoreMuteChangeEvent: false,
      isInitialized: false,
      isPodcast: false,
      lastHighlightsMuteState: true,
      isManualHighlightsPlayback: false,
      bypassMuteCall: false,
      expandViewOpen: false,
      miniPlayerWasPlayingBeforeExpand: false,
      miniPlayerPausedByCoordination: false,
      highlightsPlayerShouldPlayAgain: false,
    };
  }

  /**
   * Returns a readonly copy of current state for external access
   */
  public getState(): Readonly<HighlightsPlayerState> {
    return { ...this.state };
  }

  /**
   * Gets the current value of a specific state property
   */
  public get<K extends keyof HighlightsPlayerState>(
    key: K,
  ): HighlightsPlayerState[K] {
    return this.state[key];
  }

  /**
   * Sets the value of a specific state property
   */
  public set<K extends keyof HighlightsPlayerState>(
    key: K,
    value: HighlightsPlayerState[K],
  ): void {
    this.state[key] = value;
  }

  /**
   * Updates multiple state properties at once
   */
  public update(partial: Partial<HighlightsPlayerState>): void {
    this.state = { ...this.state, ...partial };
  }

  /**
   * Resets state to initial values
   */
  public reset(): void {
    this.state = this.createInitialState();
    this.actions = null;
  }

  /**
   * Sets the player actions from usePlayerActions hook
   */
  public setPlayerActions(playerActions: MiniPlayerActions): void {
    this.state.playerActions = playerActions;
    this.actions = playerActions;
  }

  /**
   * Sets the player state from usePlayerState hook
   */
  public setPlayerState(playerStateHook: PlayerStateHook): void {
    this.state.playerStateHook = playerStateHook;

    // Update internal playing state based on the hook state
    if (playerStateHook) {
      const wasPlaying = this.state.isMiniPlayerPlaying;
      const currentPlaybackState = playerStateHook.playbackState;

      // Only consider PLAYING as "playing" state for coordination
      this.state.isMiniPlayerPlaying = currentPlaybackState === 'PLAYING';

      // Notify Highlights SDK about Mini Player state change
      if (wasPlaying !== this.state.isMiniPlayerPlaying) {
        this.notifyHighlightsPlayerStateChange(this.state.isMiniPlayerPlaying);
      }

      // If playing state changed, handle coordination
      if (wasPlaying !== this.state.isMiniPlayerPlaying) {
        // Check bypassMuteCall flag
        if (this.state.isMiniPlayerPlaying && this.state.bypassMuteCall) {
          this.state.bypassMuteCall = false;
        } else if (
          this.state.isMiniPlayerPlaying &&
          !this.state.isHighlightsPlayerMuted &&
          this.state.isHighlightsPlayerPlaying
        ) {
          this.state.highlightsPlayerShouldUnmuteAgain = true;
          this.muteHighlightsPlayer();
        } else if (
          !this.state.isMiniPlayerPlaying &&
          this.state.highlightsPlayerShouldUnmuteAgain
        ) {
          this.state.highlightsPlayerShouldUnmuteAgain = false;
          this.unmuteHighlightsPlayer();
        }
      }

      // Handle specific playback states
      switch (currentPlaybackState) {
        case 'PLAYING':
          if (
            !this.state.isHighlightsPlayerMuted &&
            !this.state.highlightsPlayerShouldUnmuteAgain &&
            !this.state.bypassMuteCall &&
            this.state.isHighlightsPlayerPlaying
          ) {
            this.state.highlightsPlayerShouldUnmuteAgain = true;
            this.muteHighlightsPlayer();
          }
          if (this.state.bypassMuteCall) {
            this.state.bypassMuteCall = false;
          }
          if (this.state.isHighlightsPlayerPlaying) {
            this.state.highlightsPlayerShouldPlayAgain = true;
            this.pauseHighlightsPlayer();
          }

          break;

        case 'PAUSED':
        case 'IDLE':
          if (this.state.highlightsPlayerShouldUnmuteAgain) {
            this.state.highlightsPlayerShouldUnmuteAgain = false;
            this.unmuteHighlightsPlayer();
          }
          if (this.state.highlightsPlayerShouldPlayAgain) {
            this.state.highlightsPlayerShouldPlayAgain = false;
            this.playHighlightsPlayer();
          }

          break;

        case 'BUFFERING':
        case 'LOADING':
          // Do not trigger coordination changes during buffering/loading
          break;

        default:
          break;
      }
    }
  }

  /**
   * Determines if Mini Player actions (play/pause) should be executed.
   * Mini Player should NOT be controlled when expand view is open.
   */
  public shouldPerformActionOnMiniPlayer(): boolean {
    return !this.state.expandViewOpen;
  }

  /**
   * Triggers play on the Mini Player if available.
   */
  public playMiniPlayer(): void {
    if (this.actions && this.shouldPerformActionOnMiniPlayer()) {
      try {
        const result = this.actions.play();
        if (result instanceof Promise) {
          result.catch(error => {
            logger.error(
              '[PlayerCoordinator] Error from actions.play():',
              error,
            );
          });
        }
      } catch (error) {
        logger.error(
          '[PlayerCoordinator] Exception calling actions.play():',
          error,
        );
      }
    } else if (!this.shouldPerformActionOnMiniPlayer()) {
      // Skipping Mini Player play() - expand view active
    } else {
      logger.warn(
        '[PlayerCoordinator] No legacy actions available for play()',
        {},
      );
    }
  }

  /**
   * Triggers pause/stop on the Mini Player based on content type.
   */
  public pauseMiniPlayer(): void {
    if (this.actions && this.shouldPerformActionOnMiniPlayer()) {
      try {
        // Legacy actions use play() to toggle play/pause
        const result = this.actions.play();
        if (result instanceof Promise) {
          result.catch(error => {
            logger.error(
              '[PlayerCoordinator] Error from actions.play() pause/stop:',
              error,
            );
          });
        }
      } catch (error) {
        logger.error(
          '[PlayerCoordinator] Exception calling actions.play() pause/stop:',
          error,
        );
      }
    } else if (!this.shouldPerformActionOnMiniPlayer()) {
      // Skipping Mini Player pause() - expand view active
    }
  }

  /**
   * Mutes the Highlights player via SDK event emission.
   */
  public muteHighlightsPlayer(): void {
    this.state.ignoreMuteChangeEvent = true;
    window.genuin?.emit('player:mute');
  }

  /**
   * Unmutes the Highlights player via SDK event emission.
   */
  public unmuteHighlightsPlayer(): void {
    this.state.ignoreMuteChangeEvent = true;
    window.genuin?.emit('player:unmute');
  }

  public pauseHighlightsPlayer() {
    if (!this.state.isHighlightsPlayerPlaying) return;
    this.state.isHighlightsPlayerPlaying = false;
    window.genuin?.emit('player:pause');
  }

  public playHighlightsPlayer() {
    if (this.state.isHighlightsPlayerPlaying) return;
    this.state.isHighlightsPlayerPlaying = true;
    window.genuin?.emit('player:play');
  }

  /**
   * Updates follow state to the highlights SDK and internal state
   */
  public updateFollowState(payload: FollowPayloadType): void {
    window.genuin?.emit('player:onFollowChanged', payload.payload);
  }

  /**
   * Notifies Highlights SDK about Mini Player play/pause state changes
   */
  private notifyHighlightsPlayerStateChange(isPlaying: boolean): void {
    const payload = this.buildMiniPlayerPlayChangePayload(isPlaying);
    if (payload) {
      window.genuin?.emit('player:onMiniPlayerPlayChange', payload);
    }
  }

  /**
   * Builds the payload for player:onMiniPlayerPlayChange event
   * Returns null if conditions are not met for notification
   */
  private buildMiniPlayerPlayChangePayload(isPlaying: boolean):
    | { type: 'station'; stationId: number; playStatus: boolean }
    | {
        type: 'podcast';
        podcastId: number;
        episodeId: number;
        playStatus: boolean;
      }
    | null {
    const { playerStateHook, brandContext } = this.state;

    if (!playerStateHook || !brandContext || brandContext.length === 0) {
      return null;
    }

    const { type, id } = brandContext[0];
    const { stationType, stationId, trackId } = playerStateHook;

    const normalizedId = typeof stationId === 'number' ? stationId : Number(id);

    if (type === 'station' && stationType === 'live') {
      return {
        type: 'station',
        stationId: normalizedId,
        playStatus: isPlaying,
      };
    }

    if (type === 'podcast' && stationType === 'podcast') {
      return {
        type: 'podcast',
        podcastId: normalizedId,
        episodeId: typeof trackId === 'number' ? trackId : Number(trackId),
        playStatus: isPlaying,
      };
    }

    return null;
  }
}
