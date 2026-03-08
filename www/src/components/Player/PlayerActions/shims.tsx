import * as React from 'react';
import * as UPSELL_FROM from 'modules/Analytics/constants/upsellFrom';
import AlbumStation from 'web-player/models/Album';
import analytics, { Events } from 'modules/Analytics';
import factory from 'state/factory';
import hub, { E } from 'shared/utils/Hub';
import LegacyPlayerState from 'web-player/PlayerState';
import LiveStation from 'web-player/models/Live';
import logger, { CONTEXTS } from 'modules/Logger';
import playback, {
  Data as PlayAnalyticsData,
} from 'modules/Analytics/helpers/playback';
import playedFrom from 'modules/Analytics/constants/playedFrom';
import trackers from 'trackers';
import UPSELL from 'constants/upsellTracking';
import {
  addTrackToPlaylistSelector,
  editPlayableAsRadioSelector,
  getIsTrialEligible,
  getSubscriptionType,
  moreSkipsUpsellSelector,
} from 'state/Entitlements/selectors';
import { ConnectedModals } from 'state/UI/constants';
import { createDeferrableRadio, togglePlayback } from 'shims/playbackActions';
import { Episode } from 'state/Podcast/types';
import { formatStationAsset } from 'modules/Analytics/legacyHelpers';
import { get } from 'lodash-es';
import { getAbTests } from 'state/User/selectors';
import { getDailySkips, getSkipsLeft } from 'state/Player/selectors';
import { getFollowedBySeedId } from 'state/Podcast/selectors';
import {
  getFreeUserMyPlaylistEnabled,
  getInternationalPlaylistRadioEnabled,
  getIsStationSpecificRegGateEnabled,
} from 'state/Features/selectors';
import {
  getIsAnonymous,
  getIsLoggedOut,
  getProfileId,
} from 'state/Session/selectors';
import { getIsFavoriteByTypeAndId } from 'state/Stations/selectors';
import { getMuted, getStation } from 'state/Playback/selectors';
import { getPodcastEpisodeUrl, getPodcastUrl } from 'state/Podcast/helpers';
import {
  getRegGateStationIds,
  getStationSoftgate,
} from 'state/Config/selectors';
import {
  getSentimentById,
  getTracksThumbsSentiments,
} from 'state/Tracks/selectors';
import { getTranslateFunction } from 'state/i18n/helpers';
import { getUI } from 'state/UI/selectors';
import { GrowlIcons } from 'components/Growls/constants';
import { isPlaylist } from 'state/Playlist/helpers';
import { OD_BACK_WAIT } from 'constants/playback';
import {
  openModal,
  openSignupModal,
  openUpsellModal,
  showFollowedChangedGrowl,
  showNotifyGrowl,
} from 'state/UI/actions';
import {
  PlaybackTypeValue,
  STATION_TYPE,
  StationTypeValue,
} from 'constants/stationTypes';
import { podcast } from 'modules/Analytics/helpers/stationMappers';
import { REGGATE_TYPES } from 'constants/regGateTypes';
import {
  resolvePrerollAdParams,
  resolvePrerollAdType,
} from 'ads/playback/resolvers';
import { resolveStationUrl } from 'utils/playerUtils';
import {
  SaveDeleteComponent,
  SaveDeleteView,
} from 'modules/Analytics/helpers/saveDelete';
import { Sentiment } from 'state/Stations/types';
import { toggleMute } from 'state/Playback/actions';
import { toggleStationSaved, updateThumbsData } from 'state/Stations/actions';
import {
  updateFollowed,
  updatePodcastPlayProgress,
} from 'state/Podcast/actions';
import { v4 as uuid } from 'uuid';
import { WIDGET_DIMENSIONS } from 'constants/widgetDimensions';
import type { AddToPlaylistContext } from 'components/AddToPlaylistModal';
import type { AdsPlayerContext } from 'ads/playback/types';
import type { Data as OpenCloseData } from 'modules/Analytics/helpers/openClose';
import type { ShareContext } from 'state/UI/types';

const legacyPlayerState = LegacyPlayerState.getInstance();

const store = factory();
const translate = getTranslateFunction(store.getState());

const openSignup = (context: string) => openSignupModal({ context });

const openShare = ({ model, ...context }: ShareContext) =>
  openModal({
    id: ConnectedModals.Share,
    context: {
      ...context,
      model: model?.toJSON() ?? model,
    },
  });

const openAddToPlaylist = (context: AddToPlaylistContext) =>
  openModal({ id: ConnectedModals.AddToPlaylist, context });

export const checkForRegGate = (
  stationType: StationTypeValue,
  stationId?: number | string,
) => {
  const TestGroups = {
    // IHRWEB-17405 Test hard reg gate for podcasts in NZ
    nzPodcastNoRegGate: 'A',
    nzPodcastRegGate: 'B',
    webRegisterToStreamRegGate: 'B',
  };

  const state = store.getState();
  // If the user is logged in, we shouldn't reg gate
  const isAnonymous = getIsAnonymous(state);

  if (!isAnonymous) return false;

  const abTestGroups = getAbTests(state);

  const isStationSpecificRegGate = getIsStationSpecificRegGateEnabled(state);

  let shouldRegGate = false;

  let regGateType = REGGATE_TYPES.default;
  if (
    (abTestGroups?.nzWebPodcastRegistrations === TestGroups.nzPodcastRegGate &&
      stationType === STATION_TYPE.PODCAST) ||
    abTestGroups?.webRegisterToStream === TestGroups.webRegisterToStreamRegGate
  ) {
    shouldRegGate = true;
  }

  if (isStationSpecificRegGate) {
    const stationIds = getRegGateStationIds(state);
    if (stationIds.includes(Number(stationId))) {
      shouldRegGate = true;
      regGateType = REGGATE_TYPES.STATION;
    }
  }

  if (shouldRegGate) store.dispatch(openSignup(regGateType));

  return shouldRegGate;
};

export function next() {
  const state = store.getState();
  const firstSkip = getDailySkips(state) === 15;
  const noSkipsLeft = getSkipsLeft(state) === 0;
  const isTrialEligible = getIsTrialEligible(state);
  const subscriptionType = getSubscriptionType(state);
  const moreSkipsUpsell = moreSkipsUpsellSelector(state);

  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;
  const stationType = station.get('seedType') as StationTypeValue;
  const isReplay = track.get('isReplay');

  if (stationType === 'live' && isReplay) {
    hub.trigger(E.PLAYER_REPLAY_SKIP);
  } else if (stationType === 'podcast') {
    /**
     * IHRWEB-14904 stop podcasts from playing in the background when all episodes are played
     * to prevent podcasts playing in the background, we need to check if there are any uncompleted episodes
     * or it is the last episode.
     */
    const episodeId = track.get('id');
    // get episodes from store. podcasts stored in ascending order, but playlist is in descending order
    const { podcast: podcastState } = store.getState();
    const episodes = Object.values(
      podcastState.episodes,
    ).reverse() as Array<Episode>;
    // bool: are there are any uncompleted episodes after the current episode?
    const playable = !!episodes
      .slice(episodes.findIndex(episode => episode.id === episodeId) + 1)
      .filter(episode => !episode.completed).length;
    // if no playable tracks, stop playing and reset the station to clear currently playing, else skip
    if (!playable) {
      hub.trigger(E.PLAYER_PLAY_TOGGLED);
      hub.trigger(E.PLAYER_SCRUBBER_END, track.get('duration'));
    } else {
      hub.trigger(E.PLAYER_SKIP_CLICKED);
    }
  } else if (noSkipsLeft && moreSkipsUpsell) {
    trackers.track(Events.UpsellOpen, {
      type: 'MORE_SKIPS_WEB',
      subscriptionType,
      isTrialEligible,
    });
    if (analytics?.trackUpsellOpen) {
      analytics.trackUpsellOpen({
        destination: UPSELL_FROM.NEW_SCREEN,
        promotionSubscriptionTier: subscriptionType,
        upsellFrom: UPSELL.SKIP_LIMIT.id,
        upsellType: UPSELL_FROM.TRIGGERED,
        vendor: 'Braze',
      });
    }
  } else {
    if (firstSkip && moreSkipsUpsell) {
      trackers.track(Events.UpsellOpen, {
        type: 'SHOW_FIRST_SKIP',
        isTrialEligible,
        subscriptionType,
      });
    }
    hub.trigger(E.PLAYER_SKIP_CLICKED);
  }
}

export function prev() {
  const position = legacyPlayerState.getPosition();

  if (position > OD_BACK_WAIT) {
    hub.trigger(E.PLAYER_RESTART_OD);
  } else {
    hub.trigger(E.PLAYER_PREVIOUS_OD);
  }
}

export function back() {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;
  const position = legacyPlayerState.getPosition();
  const trackId = get(track, 'id');
  const duration = legacyPlayerState.getDuration();

  if (trackId && duration) {
    hub.trigger(E.SEEK_RELATIVE, -15);
    // only podcasts use this function
    analytics.track(
      Events.Back15,
      podcast(station, track, position?.toFixed(2)),
    );
  }
}

export function forward() {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;
  const trackId = get(track, 'id');
  const duration = legacyPlayerState.getDuration();
  const position = legacyPlayerState.getPosition();
  const stationId = station.get('seedId');
  const stationType = station.get('seedType');

  if (trackId && duration) {
    hub.trigger(E.SEEK_RELATIVE, 30);
    // only podcasts use this function
    analytics.track(
      Events.Forward30,
      podcast(station, track, position?.toFixed(2)),
    );
  }

  if (stationType === STATION_TYPE.PODCAST) {
    store.dispatch(
      updatePodcastPlayProgress(position, stationId, trackId as number),
    );
  }
}

export function share(includeTimestamp = false) {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack();
  const state = store.getState();
  const stationId = station.get('id');
  const stationName = station.get('name');
  const seedType = station.get('seedType');
  const trackBraze: { [key: string]: any } = {};
  if (track) {
    trackBraze.artistName = track.get('artist');
    trackBraze.artistId = track.get('artistId');
    trackBraze.trackName = track.get('title');
  }

  if (seedType === STATION_TYPE.LIVE) {
    const { widgetLive } = state.features.flags;
    const dimensions = widgetLive ? WIDGET_DIMENSIONS.LIVE : undefined;
    trackers.track(Events.Share, {
      seedType,
      seedId: stationId,
      stationName,
      ...trackBraze,
    });
    store.dispatch(
      openShare({
        seedType,
        seedId: stationId,
        url: station.get('url'),
        dimensions,
      }),
    );
  } else if (seedType === STATION_TYPE.PODCAST) {
    const { widgetPodcastEpisode, widgetPodcastProfile } = state.features.flags;
    const dimensions =
      widgetPodcastEpisode || widgetPodcastProfile ?
        WIDGET_DIMENSIONS.PODCAST_EPISODE
      : undefined;
    let shareUrl;
    let episodeId;
    let title;
    if (track) {
      shareUrl = getPodcastEpisodeUrl(
        station.get('seedId'),
        station.get('slug'),
        track.get('episodeId')!,
        track.get('title')!,
        includeTimestamp ?
          Math.floor(legacyPlayerState.getPosition())
        : undefined,
      );
      episodeId = track.get('episodeId');
      title = track.get('title');
    } else {
      shareUrl = getPodcastUrl(station.get('seedId'), station.get('slug'));
    }
    trackers.track(Events.Share, {
      seedType,
      seedId: stationId,
      stationName,
      ...trackBraze,
      episodeId,
    });

    store.dispatch(
      openShare({
        seedType,
        seedId: stationId,
        episodeId,
        url: shareUrl,
        model: track,
        stationName: title,
        dimensions,
        fromTimestamp:
          includeTimestamp ? Math.floor(legacyPlayerState.getPosition()) : 0,
      }),
    );
  } else {
    const artistId = (station as AlbumStation).get('artistId');
    const playlistId = station.get('seedId');
    const id = seedType === STATION_TYPE.ARTIST ? artistId : stationId;
    const stationUrl =
      isPlaylist(seedType) ? null : resolveStationUrl(station.toJSON());
    trackers.track(Events.Share, {
      seedType,
      seedId: stationId,
      stationName,
      ...trackBraze,
      playlistId,
    });
    store.dispatch(
      openShare({
        seedType: String(seedType),
        seedId: isPlaylist(seedType) ? playlistId : id,
        url: station.get('url') || stationUrl,
        model: station,
        stationName,
        hideDescription: true,
      }),
    );
  }
}

// IHRWEB-16231 - AA - Track stations use artist controls, but need to send the artistId as seedId
type FavoriteArgs = React.MouseEvent<HTMLElement> & {
  favoriteSeedType?: 'seedId' | 'artistId';
};

export function favorite({ favoriteSeedType = 'seedId' }: FavoriteArgs) {
  const state = store.getState();
  const isAnonymous = getIsAnonymous(state);
  const station = legacyPlayerState.getStation()!;
  const seedType = station.get('seedType') as StationTypeValue;

  if (isAnonymous) {
    const context = seedType === STATION_TYPE.LIVE ? 'live_favorite' : '';

    store.dispatch(openSignup(context));
    return;
  }

  store.dispatch(toggleStationSaved(seedType, station.get(favoriteSeedType)));

  const favorited = getIsFavoriteByTypeAndId(store.getState(), {
    seedId: station.get('seedId'),
    seedType,
  });

  const name = station.get('name');
  const icon = favorited ? GrowlIcons.Deleted : GrowlIcons.CheckCircle;

  store.dispatch(
    showNotifyGrowl({
      title:
        favorited ?
          translate(`{name} has been removed from Your Library`, { name })
        : translate(`{name} has been saved to Your Library`, { name }),
      icon,
    }),
  );
}

export function addToPlaylist() {
  const reduxState = store.getState();
  const station = getStation(reduxState);

  if (!station) return;

  const track = get(station, 'track') || legacyPlayerState.getTrack();
  const trackId = get(track, 'id');
  const canAddTrackToPlaylist = addTrackToPlaylistSelector(reduxState);

  const canEditPlayableAsRadio = editPlayableAsRadioSelector(reduxState);
  const isFreeMyPlaylistEnabled = getFreeUserMyPlaylistEnabled(reduxState);
  const isInternationalPlaylistRadioEnabled =
    getInternationalPlaylistRadioEnabled(reduxState);
  const isAnonymous = getIsAnonymous(reduxState);
  const { isFSPOpen } = getUI(reduxState);
  const shouldAddToPlaylistOpen =
    (isFreeMyPlaylistEnabled || isInternationalPlaylistRadioEnabled) &&
    canEditPlayableAsRadio;

  if (isAnonymous) {
    store.dispatch(openSignupModal({ context: 'add_to_playlist' }));
  } else if (
    track &&
    trackId &&
    (canAddTrackToPlaylist || shouldAddToPlaylistOpen)
  ) {
    store.dispatch(
      openAddToPlaylist({
        component:
          isFSPOpen ?
            SaveDeleteComponent.Overflow
          : SaveDeleteComponent.MiniPlayer,
        trackIds: [trackId],
        type: STATION_TYPE.TRACK,
        view: isFSPOpen ? SaveDeleteView.FullScreenPlayer : undefined,
      }),
    );
  } else {
    store.dispatch(
      openUpsellModal({
        upsellFrom:
          station.type === 'live' ?
            UPSELL.LIVE_RADIO_ADD_TO_PLAYLIST
          : UPSELL.CUSTOM_RADIO_ADD_TO_PLAYLIST,
        headerCopy: translate(
          'Create unlimited playlists. Try iHeart All Access.',
        ),
        analyticsUpsellFrom: UPSELL_FROM.PLAYER_CUSTOM_ADD_TRACK_TO_PLAYLIST,
      }),
    );
  }
}

export function seek(timeSeconds: number) {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack();
  if (!track) return;
  const trackId = track.get('id');
  const stationType = station.get('seedType');
  const stationId = station.get('id');

  hub.trigger(E.PLAYER_SCRUBBER_END, timeSeconds);

  if (stationType === STATION_TYPE.PODCAST) {
    store.dispatch(updatePodcastPlayProgress(timeSeconds, stationId, trackId!));
  }
}

function setThumb(sentiment: Sentiment) {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;
  const trackId = track.get('id');
  const stationType = station.get('seedType') as StationTypeValue;
  const stationId = station.get('id');
  const seedId = station.get('seedId');
  const seedType = station.get('seedType') as StationTypeValue;
  const artistId = track.get('artistId');
  const artistName = track.get('artist');
  const stationName = station.get('name');
  const nameMap = {
    [STATION_TYPE.ARTIST]: artistName,
    [STATION_TYPE.COLLECTION]: stationName,
    [STATION_TYPE.PLAYLIST_RADIO]: stationName,
  };

  const existingSentiment = getSentimentById(
    getTracksThumbsSentiments(store.getState()),
    trackId!,
  );
  const newSentiment = Number(existingSentiment) === sentiment ? 0 : sentiment;

  store.dispatch(
    updateThumbsData({
      existingSentiment,
      seedId,
      sentiment: newSentiment,
      stationId,
      stationType,
      trackId: trackId!,
      trackingData: {
        artistId,
        artistName,
        callLetters: (station as LiveStation).get('callLetters'),
        id: seedType === 'artist' ? artistId : station.get('seedId'),
        itemId: artistId,
        itemName: artistName,
        name: nameMap[seedType] || track.get('album'),
        profileId: getProfileId(store.getState()),
        songId: track.get('id'),
        songName: track.get('title'),
        type: seedType,
      },
    }),
  );
}

export function thumbDown() {
  return setThumb(-1);
}

export function thumbUp() {
  return setThumb(1);
}

export function toggleFollowed() {
  const reduxState = store.getState();
  const isLoggedOut = getIsLoggedOut(reduxState);
  const stationSoftgate = getStationSoftgate(reduxState);
  const station = legacyPlayerState.getStation()!;
  const seedType = station.get('seedType');
  const hasSoftgate = get(stationSoftgate, seedType!);

  if (hasSoftgate && isLoggedOut) {
    store.dispatch(openSignup('reg-gate'));
  } else {
    const seedId = station.get('seedId');
    const stationId = station.get('id');
    const isFollowed = getFollowedBySeedId(store.getState(), {
      seedId,
      stationId,
    });
    store.dispatch(
      updateFollowed({ followed: !isFollowed, seedId: seedId || stationId }),
    );
    store.dispatch(
      showFollowedChangedGrowl({
        isFollowed: !isFollowed,
        name: station.get('title'),
      }),
    );
  }
}

export function expand() {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;
  const stationType = station?.get('seedType');

  if (stationType) {
    analytics.trackOpenClosePlayer!({
      action: 'open',
      artistId: station.get('artistId'),
      artistName: station.get('artist'),
      collection: {
        curated: station.get('curated'),
        id: station.get('playlistId'),
        type: station.get('playlistType'),
        userId: station.get('ownerId'),
      },
      id: station.get('seedId'),
      name: station.get('callLetters') || station.get('name'),
      profileId: legacyPlayerState.get('creds').profileId,
      trackArtistId: track && track.get('artistId'),
      trackArtistName: track && track.get('artist'),
      trackId: track && track.get('id'),
      trackName: track && track.get('title'),
      type: station.get('seedType'),
    } as OpenCloseData);

    analytics.track(Events.PageView, {
      pageName: 'full_screen_player',
      view: {
        asset: formatStationAsset({
          artistId:
            (track && track.get('artistId')) ||
            (station as AlbumStation).get('artistId'),
          artistName: track && track.get('artist'),
          callLetters: (station as LiveStation).get('callLetters'),
          id: station.get('seedId'),
          name: station.get('name'),
          playlistData: station.get('playlist'),
          profileId: getProfileId(store.getState()),
          type: stationType,
        }),
      },
    });
  }
}

export function minimize() {
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;

  analytics.trackOpenClosePlayer!({
    action: 'close',
    artistId: station.get('artistId'),
    artistName: station.get('artist'),
    collection: {
      curated: station.get('curated'),
      id: station.get('playlistId'),
      type: station.get('playlistType'),
      userId: station.get('ownerId'),
    },
    id: station.get('seedId'),
    name: station.get('callLetters') || station.get('name'),
    profileId: legacyPlayerState.get('creds').profileId,
    trackArtistId: track && track.get('artistId'),
    trackArtistName: track && track.get('artist'),
    trackId: track && track.get('id'),
    trackName: track && track.get('title'),
    type: station.get('seedType'),
  } as OpenCloseData);
}

export function play(adsPlayer?: AdsPlayerContext) {
  legacyPlayerState.set('streamInitTime', Date.now());
  const station = legacyPlayerState.getStation()!;
  const track = legacyPlayerState.getTrack()!;
  const playingState = legacyPlayerState.getPlayingState();

  const stationId = station.get('seedId') || station.get('id') || '';
  const profileId = getProfileId(store.getState());

  const stationType = (
    station?.attrs?.playlistType === 'default' ?
      'my_playlist'
    : station.get('seedType')) as PlaybackTypeValue;

  if (checkForRegGate(stationType)) return false;

  analytics.track(
    Events.Play,
    playback(Events.Play, {
      ...(track ?
        {
          trackId: track.get('id')!,
          trackName: track.get('title'),
          trackArtistName: track.get('artist'),
          trackArtistId: track.get('artistId'),
        }
      : {}),
      artistName: station.get('artistName'),
      artistId: station.get('artistId'),
      name:
        station.get('name') ??
        station.get('title') ??
        station.get('artistName'),
      id: stationId,
      profileId,
      sessionId: uuid(),
      type: stationType,
      collection: {
        reportingKey: station.get('reportingKey'),
        curated: station.get('curated'),
        type: station.get('playlistType'),
        ownerId: station.get('ownerId'),
      },
    } as PlayAnalyticsData),
  );
  // AA 11/11/20 - IHRWEB-15872 - Avoid weird tracking behavior by removing unneeded unmutes. The player will unmute when playerstate changes to playing.
  if (getMuted(store.getState()) && playingState !== 'PLAYING')
    store.dispatch(toggleMute());

  if (track === null) {
    const playStation = createDeferrableRadio({
      playingState,
      playedFrom: playedFrom.PLAYER_PLAY,
      stationId: station.get('seedId') || station.get('id'),
      stationType: station.get('seedType') as StationTypeValue,
    });

    if (adsPlayer) {
      const adType = resolvePrerollAdType(station.get('seedType'));

      return adsPlayer
        .load(
          adType,
          resolvePrerollAdParams(adType, {
            playedFrom: playedFrom.PLAYER_PLAY,
            stationId,
            stationType,
          }),
        )
        .then(adsPlayer.play)
        .then(playStation)
        .catch(err => {
          logger.error(
            [CONTEXTS.PLAYBACK, CONTEXTS.ADS],
            `error loading preroll: ${err.message}`,
            err,
          );
          playStation();
        });
    }

    return playStation();
  }

  if (track) {
    trackers.track(Events.Play, {
      type: station.get('seedType') as StationTypeValue,
      typeId: stationId,
      id: track.get('id'),
      name: track.get('title'),
    });

    if (adsPlayer && playingState !== 'PLAYING') {
      const adType = resolvePrerollAdType(station.get('seedType'));

      return adsPlayer
        .load(
          adType,
          resolvePrerollAdParams(adType, {
            playedFrom: playedFrom.PLAYER_PLAY,
            stationId,
            stationType,
          }),
        )
        .then(adsPlayer.play)
        .then(() => togglePlayback(playedFrom.PLAYER_PLAY))
        .catch(err => {
          logger.error(
            [CONTEXTS.PLAYBACK, CONTEXTS.ADS],
            `error loading preroll: ${err.message}`,
            err,
          );
          togglePlayback(playedFrom.PLAYER_PLAY);
        });
    }
  }

  return togglePlayback(playedFrom.PLAYER_PLAY);
}

export function changeSpeed(speed: number, previousSpeed?: number) {
  hub.trigger(E.UPDATE_SPEED, speed);

  if (previousSpeed) {
    const station = legacyPlayerState.getStation();
    const track = legacyPlayerState.getTrack();

    // Should never be null, but let's be safe here
    const podcastId = station?.get('id');
    const podcastName = station?.get('title');

    // Can be null, fallback to null to match prior behavior
    const episodeId = track?.get('id') ?? null;
    const episodeName = track?.get('title') ?? null;

    const asset = {
      id: `podcast|${podcastId}`,
      name: podcastName,
      sub: {
        id: `episode|${episodeId}`,
        name: episodeName,
      },
    };

    analytics.track(Events.SpeedChange, {
      item: {
        asset,
      },
      speedChange: {
        newPlaybackSpeed: speed,
        oldPlaybackSpeed: previousSpeed,
      },
      station: {
        asset,
      },
    });
  }
}
