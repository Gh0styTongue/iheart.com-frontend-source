import * as React from 'react';
import * as UPSELL_FROM from 'modules/Analytics/constants/upsellFrom';
import analytics, { Events } from 'modules/Analytics';
import logger, { CONTEXTS } from 'modules/Logger';
import playback, {
  Data as PlayAnalyticsData,
} from 'modules/Analytics/helpers/playback';
import PlayButton from 'components/Player/PlayButton';
import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import PlayerState from 'web-player/PlayerState';
import trackers from 'trackers';
import { checkForRegGate } from '../PlayerActions/shims';
import { Component } from 'react';
import { createDeferrableRadio, togglePlayback } from 'shims/playbackActions';
import { Entitlements } from 'state/Entitlements/types';
import { MyMusicSubType } from 'state/Playback/types';
import {
  PlaybackTypeValue,
  STATION_TYPE,
  StationType,
  StationTypeValue,
  UPSELL_TYPES,
} from 'constants/stationTypes';
import { PLAYER_STATE as PLAYER_STATE_EVENTS } from 'constants/playback';
import {
  resolvePrerollAdParams,
  resolvePrerollAdType,
} from 'ads/playback/resolvers';
import { SHOW_UPSELL_SONG2START } from 'state/Entitlements/constants';
import { v4 as uuid } from 'uuid';
import type { AdsPlayerContext } from 'ads/playback/types';
import type { AdsPlayerState } from 'ads/playback';
import type { PlaybackState } from 'components/Player/PlayerState/types';

const playerState = PlayerState.getInstance();

export type UpsellData = {
  albumId?: string | number;
  albumTitle?: string;
  artistId?: React.ReactText;
  artistName?: string;
  curated?: boolean;
  currentAlbumId?: string | number;
  currentAlbumTitle?: string;
  isTrialEligible?: boolean;
  playedFromTrigger?: string;
  playlistId?: string;
  playlistName?: string;
  playlistUserId?: string | number;
  screen?: string;
  stationType: StationTypeValue;
  subscriptionType?: string;
  trackId?: React.ReactText;
  trackName: string;
};

export type Props = {
  adsPlayer?: AdsPlayerContext;
  adsPlayerState?: AdsPlayerState;
  allAccessPreview?: boolean;
  artistId?: number | string;
  artistName?: string;
  canPlayAlbum?: boolean;
  canPlayMyMusic?: boolean;
  canPlayPlaylist?: boolean;
  canPlayPlaylistRadio?: boolean;
  canStartArtistRadio?: boolean;
  canStartSongRadio?: boolean;
  className?: string;
  name?: string;
  curated?: boolean;
  currentAlbumId?: string | number;
  currentAlbumTitle?: string;
  currentlyPlaying?: {
    mediaId: number;
    playedFrom: string;
    seedId: number | string;
    stationTrackId: number;
    stationType: StationType;
  };
  'data-test'?: string;
  dataTest?: string;
  deferPlay?: boolean;
  entitlements?: Entitlements;
  handleOnClick?: () => boolean;
  isMuted?: boolean;
  isReplay?: boolean;
  isTrialEligible?: boolean;
  link?: {
    href: string;
    text: string;
  };
  myMusicType?: MyMusicSubType;
  playedFrom?: number;
  playedFromTrigger?: string | boolean;
  playingState: PlaybackState;
  playlistId?: string;
  playlistName?: string;
  playlistUserId?: string;
  position?: number;
  profileId?: number;
  seedId?: number | string;
  stationId?: number | string;
  stationType: PlaybackTypeValue;
  reportingStationType?: StationTypeValue;
  subscriptionType?: string;
  svgFillColor?: string;
  toggleMute?: () => boolean;
  trackId?: number | string;
  trackingContext?: string;
  trackName?: string;
  trackUuid?: string;
  useLink?: boolean;
  variantC?: boolean;
  station?: any;
  hero?: boolean;
  ButtonComponent?: typeof PlayButton;
};

class PlayButtonContainer extends Component<Props> {
  static defaultProps = {
    entitlements: {},
    link: {
      href: '',
      text: '',
    },
    playedFrom: PLAYED_FROM.PLAYER_PLAY,
    useLink: false,
  };

  onClick = () => {
    const {
      adsPlayer,
      adsPlayerState,
      allAccessPreview,
      artistId,
      artistName,
      name: propName,
      curated,
      currentAlbumId,
      currentAlbumTitle,
      deferPlay,
      entitlements,
      handleOnClick,
      isMuted,
      isTrialEligible,
      myMusicType,
      playedFrom,
      playedFromTrigger,
      playingState,
      playlistName,
      playlistUserId,
      position = 0,
      profileId,
      seedId,
      stationId,
      stationType,
      reportingStationType,
      subscriptionType,
      toggleMute,
      trackId,
      trackingContext,
      station: {
        artistName: stationArtistName,
        callLetters,
        name,
        ownerId,
        playlistId,
        playlistType,
        reportingKey,
        title,
        fallbackErrorCode,
        fallbackErrorDescription,
      } = {},
      trackName,
      trackUuid,
    } = this.props;

    if (checkForRegGate(stationType, stationId)) return false;

    // When playing an album track, createRadio fires the native upsell modal even when Braze modal has fired
    // introducing a control var here to prevent the double-modal situation
    let preventNativeUpsell = false;

    if (handleOnClick) {
      // true to continue and play new track
      // false to not play new track
      const shouldContinue = handleOnClick();
      if (!shouldContinue) {
        return false;
      }
    }

    const playbackState = this.getButtonState();

    if (
      playbackState === PLAYER_STATE_EVENTS.IDLE ||
      playbackState === PLAYER_STATE_EVENTS.PAUSED
    ) {
      playerState.set('streamInitTime', Date.now());

      analytics.track(
        Events.Play,
        playback(Events.Play, {
          trackId,
          trackName,
          artistId: artistId!,
          artistName: artistName!,
          name:
            propName ??
            callLetters ??
            name ??
            title ??
            artistName ??
            stationArtistName,
          id: seedId && seedId !== trackId ? seedId : stationId,
          profileId: profileId!,
          playedFrom,
          sessionId: uuid(),
          type: reportingStationType ?? stationType,
          collection: {
            reportingKey,
            curated,
            playlistId,
            playlistType,
            ownerId,
          },
          fallbackErrorCode,
          fallbackErrorDescription,
        } as PlayAnalyticsData),
      );

      trackers.track(Events.Play, {
        type: reportingStationType ?? stationType,
        typeId: stationId ?? '',
        id: trackId,
        name: trackName,
      });
      // AA 11/11/20 - IHRWEB-15872 - Avoid weird tracking behavior by removing unneeded unmutes. The player will unmute when playerstate changes to playing.
      if (isMuted && playingState !== PLAYER_STATE_EVENTS.PLAYING)
        toggleMute!();
    }

    const matchesCurrentlyPlaying = this.isMatchingCurrentlyPlaying();

    const BrazeTriggerRestrictions =
      !matchesCurrentlyPlaying ||
      (matchesCurrentlyPlaying && playingState !== PLAYER_STATE_EVENTS.PLAYING);

    if (
      allAccessPreview &&
      BrazeTriggerRestrictions &&
      subscriptionType !== 'PREMIUM'
    ) {
      const upsellStationType = reportingStationType ?? stationType;
      const upsellTrackName = trackName ?? '';
      const upsellData: UpsellData = {
        artistId,
        artistName,
        curated,
        currentAlbumId,
        currentAlbumTitle,
        isTrialEligible,
        playedFromTrigger: String(playedFromTrigger),
        playlistId,
        playlistName,
        playlistUserId,
        stationType: upsellStationType,
        subscriptionType,
        trackId,
        trackName: upsellTrackName,
      };

      trackers.track(Events.AAPreview, upsellData);
    }

    if (
      entitlements![SHOW_UPSELL_SONG2START] &&
      UPSELL_TYPES.includes(stationType) &&
      BrazeTriggerRestrictions &&
      artistName &&
      trackName
    ) {
      const upsellStationType = reportingStationType ?? stationType;
      const upsellData: UpsellData = {
        artistId,
        artistName,
        curated,
        currentAlbumId,
        currentAlbumTitle,
        isTrialEligible,
        playedFromTrigger: String(playedFromTrigger),
        playlistId,
        playlistName,
        playlistUserId,
        stationType: upsellStationType,
        subscriptionType,
        trackId,
        trackName,
      };

      // Braze will fire, so set preventNativeUpsell to true
      preventNativeUpsell = true;
      trackers.track(Events.UpsellOpen, {
        ...upsellData,
        type: 'SHOW_UPSELL_SONG2START',
      });
      if (analytics?.trackUpsellOpen) {
        analytics.trackUpsellOpen({
          destination: UPSELL_FROM.NEW_SCREEN,
          promotionSubscriptionTier: upsellData.subscriptionType,
          upsellFrom: UPSELL_FROM.UPSELL_SONG_2_START,
          upsellType: UPSELL_FROM.TRIGGERED,
          vendor: 'Braze',
        });
      }
    }

    if (stationId && !matchesCurrentlyPlaying) {
      // pass preventNativeUpsell into createRadio
      const play = createDeferrableRadio({
        playingState,
        deferAfterCardChange: !adsPlayer && deferPlay,
        mediaId: trackId,
        myMusicType,
        playedFrom,
        preventNativeUpsell,
        trackUuid,
        stationId,
        stationType,
        position,
      });

      if (!adsPlayer) return play();

      if (adsPlayerState?.adIsPresent) {
        // If an ad is present, it is likely an instream audio ad.
        // Defer a no-op so that skip won't resume the prev station
        adsPlayer.skip();
      }
      // Defer the play call until after ad playback resolves
      return this.loadAd()
        .then(adsPlayer.play)
        .catch(err => {
          logger.error(
            [CONTEXTS.PLAYBACK, CONTEXTS.ADS],
            `error loading preroll: ${err.message}`,
            err,
          );
        })
        .then(() => {
          play();
        });
    }

    if (adsPlayer) {
      if (adsPlayerState?.adIsPresent) {
        return adsPlayer.pause(adsPlayerState.adIsPlaying);
      }

      // IHRWEB-16607 - check for IDLE state to determine if a station
      // has not been played on server render (this.matchesCurrentlyPlaying) won't account for it
      // We only need this logic for our new ads flow so check for adsPlayer as well
      if (playingState === PLAYER_STATE_EVENTS.IDLE) {
        return this.loadAd()
          .then(adsPlayer.play)
          .catch(err => {
            logger.error(
              [CONTEXTS.PLAYBACK, CONTEXTS.ADS],
              `error loading preroll: ${err.message}`,
              err,
            );
          })
          .then(() => {
            togglePlayback(playedFrom, trackingContext);
          });
      }
    }

    return togglePlayback(playedFrom, trackingContext);
  };

  loadAd(): Promise<null | string> {
    const {
      adsPlayer,
      playedFrom,
      myMusicType,
      stationType,
      stationId,
      trackId,
    } = this.props;

    if (!adsPlayer) return Promise.resolve(null);

    const adType = resolvePrerollAdType(stationType);

    return adsPlayer.load(
      adType,
      resolvePrerollAdParams(adType, {
        playedFrom: Number(playedFrom),
        stationType,
        stationId: stationId!,
        myMusicType,
        trackId: trackId as number,
      }),
    );
  }

  getButtonState(): PlaybackState {
    const { adsPlayerState, playingState, stationId } = this.props;

    if (!stationId || this.isMatchingCurrentlyPlaying()) {
      if (adsPlayerState?.adIsPresent) {
        return adsPlayerState.adIsPlaying ?
            PLAYER_STATE_EVENTS.LOADING
          : PLAYER_STATE_EVENTS.PAUSED;
      }

      return playingState;
    }

    return PLAYER_STATE_EVENTS.PAUSED;
  }

  isPausable() {
    return this.props.stationType !== 'live' || this.props.isReplay;
  }

  isMatchingCurrentlyPlaying() {
    const { currentlyPlaying, trackId, artistId, seedId, stationType } =
      this.props;

    if (!currentlyPlaying) return false;

    if (this.hasRightEntitlements() && trackId) {
      if (currentlyPlaying.stationTrackId) {
        return currentlyPlaying.stationTrackId === trackId;
      }

      return currentlyPlaying.mediaId && currentlyPlaying.mediaId === trackId;
    }

    if ([STATION_TYPE.ARTIST, STATION_TYPE.TRACK].includes(stationType)) {
      return `${artistId || seedId}` === `${currentlyPlaying.seedId}`;
    }

    return `${currentlyPlaying.seedId}` === `${seedId}`;
  }

  hasRightEntitlements() {
    const {
      canPlayAlbum,
      canPlayMyMusic,
      canPlayPlaylist,
      canPlayPlaylistRadio,
      canStartArtistRadio,
      canStartSongRadio,
      stationType,
    } = this.props;

    const mapper = {
      [STATION_TYPE.ALBUM]: canPlayAlbum,
      [STATION_TYPE.ARTIST]: canStartArtistRadio,
      [STATION_TYPE.COLLECTION]: canPlayPlaylist,
      [STATION_TYPE.MY_MUSIC]: canPlayMyMusic,
      [STATION_TYPE.PLAYLIST_RADIO]: canPlayPlaylistRadio,
      [STATION_TYPE.PODCAST]: true,
      [STATION_TYPE.TRACK]: canStartSongRadio,
    };

    return mapper[stationType];
  }

  render() {
    const { className, dataTest, ButtonComponent = PlayButton } = this.props;
    // Should use FilledButton or Generic PlayButton

    return (
      <ButtonComponent
        buttonState={this.getButtonState()}
        className={className}
        dataTest={dataTest}
        isPausable={this.isPausable()}
        onClick={this.onClick}
        {...this.props}
      />
    );
  }
}

export default PlayButtonContainer;
