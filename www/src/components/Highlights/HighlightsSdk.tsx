import styled from '@emotion/styled';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useEffect, useMemo, useRef, useState } from 'react';

import getUser from 'state/User/selectors';
import LoadingIcon from 'styles/icons/player/Controls/Play/LoadingIcon';
import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import useTheme from 'contexts/Theme/useTheme';
import { ConnectedModals } from 'state/UI/constants';
import { createRadio, togglePlayback } from 'shims/playbackActions';
import { openModal } from 'state/UI/actions';
import { STATION_TYPE } from 'constants/stationTypes';

import type { PlayerState } from 'components/Player/PlayerState/types';
import type { State } from 'state/buildInitialState';

import { extractClipSlugAndId } from '../../utils/HighlightsUtils';
import { playerCoordinator } from './Coordinator';

import usePodcastHeroState from 'views/Podcast/PodcastHero/usePodcastHeroState';
import { getIsFavorite } from 'state/Live/selectors';

import logger from 'modules/Logger';
import type { HighlightsConfig } from './Coordinator';

// Styled container for centered loading spinner
const SpinnerContainer = styled.div<{ isDark: boolean }>(({ isDark }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: isDark ? '#1d1f20' : '#f4f5f6',
}));

/**
 * function to trigger playback for different content types.
 * @param options
 *
 */
export function playMiniPlayerContent(options: {
  type: 'podcast' | 'episode' | 'station';
  podcastId?: string | number;
  episodeId?: string | number;
  stationId?: string | number;
  playerState?: PlayerState | null;
}): void {
  const { type, podcastId, episodeId, stationId, playerState } = options;

  // Helper to check if content is already loaded and can be resumed
  const canResume = (
    expectedType: string,
    expectedId: string | number,
    additionalCheck?: boolean,
  ): boolean => {
    if (!playerState) return false;

    const isSameType = playerState.stationType === expectedType;
    const isSameId = String(playerState.stationId) === String(expectedId);
    const isPausedOrIdle =
      playerState.playbackState === 'PAUSED' ||
      playerState.playbackState === 'IDLE';

    return (
      isSameType && isSameId && isPausedOrIdle && (additionalCheck ?? true)
    );
  };

  // Helper to resume or create new playback
  const resumeOrPlay = (
    shouldResume: boolean,
    stationType: string,
    id: string | number,
    mediaId?: string | number,
  ): void => {
    if (shouldResume) {
      togglePlayback(PLAYED_FROM.DEFAULT);
    } else {
      createRadio({
        stationType,
        stationId: id,
        playedFrom: PLAYED_FROM.DEFAULT,
        ...(mediaId && { mediaId }),
      });
    }
  };

  try {
    if (type === 'podcast' && podcastId) {
      const shouldResume = canResume(STATION_TYPE.PODCAST, podcastId);
      resumeOrPlay(shouldResume, STATION_TYPE.PODCAST, podcastId);
    } else if (type === 'episode' && podcastId && episodeId) {
      const isExactEpisode = playerState?.trackId === episodeId;
      const shouldResume = canResume(
        STATION_TYPE.PODCAST,
        podcastId,
        isExactEpisode,
      );
      resumeOrPlay(shouldResume, STATION_TYPE.PODCAST, podcastId, episodeId);
    } else if (type === 'station' && stationId) {
      const shouldResume = canResume(STATION_TYPE.LIVE, stationId);
      resumeOrPlay(shouldResume, STATION_TYPE.LIVE, stationId);
    }
  } catch (error) {
    logger.error('Error triggering playback:', error);
  }
}

/**
 * Custom hook to extract and memoize user configuration for SDK initialization.
 * Only returns a new object when relevant user properties change.
 */
function useUserConfig(
  user: {
    session?: {
      isAnonymous?: boolean;
      profileId?: number | null;
      sessionId?: string | null;
    };
  } | null,
) {
  const prevConfigRef = useRef<{
    isAnonymous: boolean;
    profileId: number | undefined;
    sessionId: string | undefined;
  } | null>(null);

  return useMemo(() => {
    if (!user?.session) {
      return null;
    }

    const config = {
      isAnonymous: Boolean(user.session.isAnonymous),
      profileId: user.session.profileId ?? undefined,
      sessionId: user.session.sessionId ?? undefined,
    };

    // Return previous reference if values unchanged
    const prev = prevConfigRef.current;
    if (
      prev?.isAnonymous === config.isAnonymous &&
      prev?.profileId === config.profileId &&
      prev?.sessionId === config.sessionId
    ) {
      return prev;
    }

    prevConfigRef.current = config;
    return config;
  }, [user?.session]);
}

/**
 * Check if Highlights user data exists in localStorage
 */
function hasHighlightsUserData(isAnonymous: boolean): boolean {
  try {
    return (
      (typeof window !== 'undefined' &&
        window.localStorage.getItem('genuin-user-data') !== null) ||
      !isAnonymous
    );
  } catch {
    return false;
  }
}

/**
 * Props for the Clips component
 */
export interface HighlightsSDKProps {
  /** API key for authentication */
  apiKey?: string;
  /** CSS class name for the SDK container */
  className?: string;
  /** placement ID for the player */
  placementId?: string;
  /** style ID for theming */
  styleId?: string;
  /** Height of the player (px or string with units) */
  height?: string | number;
  /** Page context for analytics */
  pageContext?: string;
  /** Inline CSS styles for the container */
  style?: {
    [key: string]: string | number;
  };
  /** User authentication token */
  token?: string;
  /** Width of the player (px or string with units) */
  width?: string | number;
  /** Podcast ID for brand context */
  podcastId?: number;
  /** Podcast name for analytics */
  podcastName?: string;
  /** Station ID for brand context */
  stationId?: number;
  /** Station name for analytics */
  stationName?: string;
  /** Combined clip slug and ID for direct clip loading (format: "slug-shortId_uuid") */
  clipSlugAndId?: string;
  /**
   * Specifies which Highlights SDK implementation to use —
   * `'legacy'` for the old setup or `'polaris'` for the new Polaris-based version.
   */
  highlightsSDKSourceType: 'legacy' | 'polaris';
  /** Indicates whether ads are enabled to manage layout behavior accordingly. */
  isAdsEnabled?: boolean;
}

/**
 * Maps playerState.stationType to the activePlayingType schema
 * which accepts 'episode' | 'live' | 'station'
 */
function mapStationTypeToActivePlayingType(
  stationType?: string,
): 'episode' | 'live' | 'podcast' | 'station' | undefined {
  if (!stationType) return undefined;

  const normalizedType = stationType.toLowerCase().trim();
  const validTypes = ['podcast', 'episode', 'live', 'station'] as const;

  // Type guard to check if normalizedType is one of the valid types
  const isValidType = (
    type: string,
  ): type is 'episode' | 'live' | 'podcast' | 'station' => {
    return (validTypes as ReadonlyArray<string>).includes(type);
  };

  if (isValidType(normalizedType)) {
    return normalizedType;
  }

  return undefined;
}

export function HighlightsSDK({
  placementId,
  apiKey,
  styleId,
  width = '100%',
  height = 440,
  className = 'gen-sdk-class',
  style,
  token,
  podcastId,
  podcastName,
  stationId,
  stationName,
  clipSlugAndId,
  highlightsSDKSourceType,
  isAdsEnabled,
}: HighlightsSDKProps) {
  const isInitializedRef = useRef(false);
  const [showExpandViewLoader, setShowExpandViewLoader] =
    useState(!!clipSlugAndId);
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const store = useStore();
  const theme = useTheme();
  const playerState = usePlayerState();
  const playerActions = usePlayerActions();
  const podcastHeroState = usePodcastHeroState();
  const liveHeroStateFollowed = useSelector(getIsFavorite);

  // Extract user config that only changes when relevant properties change
  const userConfig = useUserConfig(user);

  // Track previous player state to detect changes
  const prevPlayerStateRef = useRef(playerState?.playbackState);

  // Set up player coordination for audio/video synchronization and dispatch
  useEffect(() => {
    if (!playerState || !playerActions) {
      return;
    }

    // Set player actions in the coordinator so it can control audio playback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerCoordinator.setPlayerActions(playerActions as any);

    // Set player state for coordination
    playerCoordinator.setPlayerState(playerState);

    // Set the Redux dispatch function for opening authentication modals
    playerCoordinator.setDispatch(dispatch);

    // Inject the playback callback to avoid circular dependency
    playerCoordinator.setPlayContentCallback(playMiniPlayerContent);
    playerCoordinator.setReduxGetState(store.getState as () => State);
  }, [playerState, playerActions, dispatch, store]);

  // Update follow state in the coordinator when podcastHeroState changes
  useEffect(() => {
    playerCoordinator.updateFollowState(podcastHeroState.followed);
  }, [podcastHeroState.followed]);

  // Update follow state in the coordinator when liveHeroStateFollowed changes
  useEffect(() => {
    playerCoordinator.updateFollowState(liveHeroStateFollowed);
  }, [liveHeroStateFollowed]);

  // Monitor player state changes for debugging
  useEffect(() => {
    const currentPlaybackState = playerState?.playbackState;
    const prevPlaybackState = prevPlayerStateRef.current;

    if (currentPlaybackState !== prevPlaybackState) {
      prevPlayerStateRef.current = currentPlaybackState;
    }
  }, [playerState?.playbackState]);

  // Initialize Clips SDK with user context and brand information
  // Client-side only - useEffect only runs in browser, not on server
  useEffect(() => {
    // Double-check we're on client side
    if (typeof window === 'undefined') {
      return undefined;
    }

    // Clean up previous initialization if it exists
    if (isInitializedRef.current) {
      playerCoordinator.cleanup();
      isInitializedRef.current = false;
    }

    // Add delay only if genuin-user-data is not present and user is anonymous
    // This gives time for the SDK to be loaded and user data to be available
    const delay =
      hasHighlightsUserData(userConfig?.isAnonymous ?? true) ? 1000 : 0;

    const initTimeout = setTimeout(() => {
      try {
        // Capture current player state values at initialization time
        // These are only used for the initial brand context setup
        const currentStationId = playerState?.stationId;
        const currentStationType = playerState?.stationType;
        const isPlaying = playerState?.playbackState === 'PLAYING';

        // Build brand context array with podcast/station IDs
        const brandContext: HighlightsConfig['brand_context'] = [];
        const activePlayingType =
          mapStationTypeToActivePlayingType(currentStationType);

        if (podcastId) {
          brandContext.push({
            id: podcastId.toString(),
            type: 'podcast',
            activePlayingId: currentStationId,
            activePlayingType,
            isPlaying,
          });
        }
        if (stationId) {
          brandContext.push({
            id: stationId.toString(),
            type: 'station',
            activePlayingId: currentStationId,
            activePlayingType,
            isPlaying,
          });
        }

        // Initialize Clips SDK with user authentication and parameters
        const config: HighlightsConfig = {
          // Only pass token and user parameters if user is not anonymous
          ...(userConfig &&
            !userConfig?.isAnonymous && {
              // If no token provided, use user's profileId as token
              token:
                token ??
                (userConfig.profileId ?
                  `${userConfig.profileId}@iheartmedia.com`
                : undefined),
              // Pass user parameters if user is logged in
              ...(userConfig.profileId && {
                params: {
                  name: String(userConfig.profileId),
                  profileId: userConfig.profileId,
                  brandUserIdentity: String(userConfig.profileId),
                },
              }),
            }),
        };

        // Extract and validate clip ID from URL parameter
        const { clipId, clipSlug } = extractClipSlugAndId(clipSlugAndId);

        // Configure starting video if clip ID or slug is provided
        if (clipId || clipSlug) {
          config.start_video_slug = clipId || clipSlug;
        }

        // Add brand context if available
        if (brandContext.length > 0) {
          config.brand_context = brandContext;
        }

        // Set up callback for feed loaded event to hide loader
        playerCoordinator.setOnFeedLoadedCallback(() => {
          setShowExpandViewLoader(false);
          if (podcastId) {
            playerCoordinator.updateFollowState(podcastHeroState.followed);
          } else {
            playerCoordinator.updateFollowState(liveHeroStateFollowed);
          }
        });

        // Set up callback for share event to show share dialog
        playerCoordinator.setOnShareCallback((url: string, metadata) => {
          // Calculate dimensions for genreLogo based on aspect ratio
          const genreLogoAspectRatio = 9 / 16;
          const genreLogoWidth = 150;
          const genreLogoHeight = Math.round(
            genreLogoWidth / genreLogoAspectRatio,
          );

          // Open share modal with the provided URL and metadata
          dispatch(
            openModal({
              id: ConnectedModals.Share,
              context: {
                seedType: 'highlights',
                seedId: metadata?.id || 'video',
                url,
                hideDescription: false,
                stationName: metadata?.clipTitle || 'iHeartRadio',
                description:
                  metadata?.clipDescription || 'Check out this highlight!',
                hideEmbedWidget: true,
                genreLogo: metadata?.clipThumbnailUrl,
                genreLogoAspectRatio,
                genreLogoWidth,
                genreLogoHeight,
              },
            }),
          );
        });

        // Initialize the player coordinator with the configuration and ,context
        playerCoordinator.init(
          {
            config,
            stationId,
            stationName,
            podcastId,
            podcastName,
            sessionId: userConfig?.sessionId,
          },
          Boolean(podcastId), // Flag to indicate if this is a podcast context
        );

        isInitializedRef.current = true;
      } catch {
        // Reset initialization flag on error
        isInitializedRef.current = false;
      }
    }, delay);

    // Cleanup on unmount
    return () => {
      clearTimeout(initTimeout);
    };
    // Only reinitialize when core configuration changes, not when player state changes
    // Player state updates are handled separately via playerCoordinator.setPlayerState()
    // We intentionally capture playerState and podcastHeroState values at init time only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userConfig,
    podcastId,
    podcastName,
    stationId,
    stationName,
    clipSlugAndId,
    token,
  ]);

  // Clean up player coordinator on component unmount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .gen-sdk-class * { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important; }
    `;
    document.head.append(styleElement);

    return () => {
      playerCoordinator.cleanup();
      styleElement.remove();
    };
  }, []);

  // Convert numeric dimensions to pixel strings
  const componentStyle: Record<string, string | number> = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    '--gencl-color-primary': '#c6002b',
    ...style,
  };

  try {
    // Render Clips SDK container with required data attributes
    return (
      <>
        <div
          className={`gen-sdk-class ${className}`}
          data-ads-enabled={isAdsEnabled ?? false}
          data-api-key={apiKey}
          data-episode-id={playerState?.trackId}
          data-placement-id={placementId}
          data-player-playing={playerState?.playbackState === 'PLAYING'}
          data-style-id={styleId}
          data-theme={theme}
          data-website-type={highlightsSDKSourceType}
          id="gen-sdk-2"
          style={componentStyle}
        >
          <SpinnerContainer isDark={theme.colors.gray.primary === '#28231f'}>
            <LoadingIcon size="28px" stroke="#c6002b" strokeWidth={3} />
          </SpinnerContainer>
        </div>

        {showExpandViewLoader && (
          <div
            className="highlights-loader"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'black',
              zIndex: 9999,
            }}
          >
            <LoadingIcon size="48px" stroke="#c6002b" strokeWidth={3} />
            <style>{`
              @media (min-width: 1025px) {
                .highlights-loader {
                  top: 0 !important;
                  left: 0 !important;
                  bottom: 0 !important;
                }
              }
            `}</style>
          </div>
        )}
      </>
    );
  } catch {
    // Return a fallback div if there's a rendering error
    return (
      <div
        className={`gen-sdk-class ${className} error-fallback`}
        style={componentStyle}
      >
        {/* Clips content unavailable */}
      </div>
    );
  }
}

export default HighlightsSDK;
