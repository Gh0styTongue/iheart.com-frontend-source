import AlbumStation from 'web-player/models/Album';
import factory from 'state/factory';
import isAdPlaying from 'ads/slotControllers/lib/isAdPlaying';
import LegacyPlayerState from 'web-player/PlayerState';
import PlaylistRadioStation from 'web-player/models/PlaylistRadio';
import replayStore from 'web-player/replay';
import {
  buildCatalogUrl,
  buildImageUrl,
  buildUrl,
} from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { get } from 'lodash-es';
import { getCompanion } from 'state/Ads/selectors';
import { getIsLoggedOut } from 'state/Session/selectors';
import { getIsWarmingUp } from 'state/Player/selectors';
import { getMediaServerUrl, getSiteUrl } from 'state/Config/selectors';
import { getQueryParams } from 'state/Routing/selectors';
import { getSourceTypeName, getTextUrlPair } from './helpers';
import {
  getStationName,
  resolveArtProps,
  resolveStationName,
  resolveStationUrl,
  resolveTrackDescription,
  resolveTrackDescriptionUrl,
  resolveTrackName,
} from 'utils/playerUtils';
import { getTracksThumbsSentiments } from 'state/Tracks/selectors';
import { getTranslateFunction } from 'state/i18n/helpers';
import { isPlaylist } from 'state/Playlist/helpers';
import { PlaybackState, PlaybackType, PlayerState } from './types';
import { playbackStateMap, playbackTypeMap } from './constants';
import { PLAYER_STATE } from 'constants/playback';
import {
  scrubCollectionSelector,
  scrubCustomSelector,
  scrubMyMusicSelector,
  showReplaySelector,
  showSaveTrackPlayerSelector,
} from 'state/Entitlements/selectors';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';

const store = factory();
const legacyPlayerState = LegacyPlayerState.getInstance();

const getBaseImageUrl = (
  reduxState: any,
  track: any,
  station: any,
  adIsPlaying: boolean,
): string => {
  const mediaServerUrl = getMediaServerUrl(reduxState);
  const siteUrl = getSiteUrl(reduxState);
  const {
    imgUrl,
    catalogId = station.get('seedId'),
    catalogType = station.get('seedType'),
  } = resolveArtProps(
    track || { attrs: {} },
    station,
    adIsPlaying,
    mediaServerUrl,
    siteUrl,
  ) as {
    imgUrl: string;
    catalogId?: string;
    catalogType?: string;
  };

  return imgUrl ?
      buildImageUrl(buildUrl({ mediaServerUrl, siteUrl }, imgUrl))()
    : buildImageUrl(
        buildCatalogUrl(mediaServerUrl, {
          id: catalogId,
          resourceType: catalogType,
        }),
      )();
};

const getPlaybackState = (playingState: PlaybackState): PlaybackState => {
  const isWarmingUp = getIsWarmingUp(store.getState());
  if (isWarmingUp) return PLAYER_STATE.BUFFERING;
  const foundState = Object.keys(playbackStateMap).find(key =>
    (
      playbackStateMap[
        key as keyof typeof playbackStateMap
      ] as unknown as Array<string>
    ).includes(playingState),
  ) as PlaybackState;
  if (!foundState)
    throw new Error(`Could not find match for playing state ${playingState}`);
  return foundState;
};

const getPlaybackType = (
  track: any,
  stationType: StationTypeValue,
): PlaybackType => {
  if (track && track.get('isReplay')) return 'REPLAY';
  const foundType = Object.keys(playbackTypeMap).find(key =>
    playbackTypeMap[key as keyof typeof playbackTypeMap].includes(stationType),
  );
  if (!foundType)
    throw new Error(`Could not find match for type ${stationType}`);
  return foundType as PlaybackType;
};

const getPlayedFrom = (
  station: any,
  queryParams: Record<string, any>,
): number => {
  if (queryParams.playedFrom) {
    const playedFrom = Number.parseInt(queryParams.playedFrom as string, 10);
    if (!Number.isNaN(playedFrom)) {
      return playedFrom;
    }
  }
  return station.get('playedFrom');
};

const getIsOnDemandTrack = (track: any): boolean => {
  const isTrack = get(track, 'type') === 'track';
  const playbackRights = get(track, 'playbackRights');
  // SW 1/4/17
  // The line below is a direct copy of the existing logic, done for ticket WEB-7425.
  // We assume onDemand if playbackRights are missing.
  return (
    get(track, 'id') && isTrack && (!playbackRights || playbackRights.onDemand)
  );
};

const getStationShareable = (station: any): boolean => {
  const stationType = get(station, 'type');
  const isUnshareableType = [STATION_TYPE.MY_MUSIC].includes(stationType);
  const isUnshareableCollection =
    isPlaylist(stationType) && !get(station, 'shareable');
  const stationWasRemoved = !!station.wasRemoved && station.wasRemoved();
  return !isUnshareableType && !isUnshareableCollection && !stationWasRemoved;
};

const getStationSaveable = (station: any): boolean => {
  const stationType = get(station, 'seedType');
  const stationIsPlaylist = isPlaylist(stationType);
  const isNonCuratedPlaylist = stationIsPlaylist && !get(station, 'curated');
  const isMyMusic = stationType === STATION_TYPE.MY_MUSIC;
  const stationCanSave = !isMyMusic && !isNonCuratedPlaylist;
  return stationCanSave;
};

const getCanScrub = (reduxState: any, playbackType: PlaybackType) => {
  if (playbackType === 'REPLAY') {
    return false;
  }
  if (playbackType === 'CUSTOM') {
    return scrubCustomSelector(reduxState);
  }
  if (playbackType === 'PLAYLIST') {
    return scrubCollectionSelector(reduxState);
  }
  if (playbackType === 'PODCAST') {
    return true;
  }

  return scrubMyMusicSelector(reduxState);
};

export function getPlayerState(): PlayerState | null {
  const reduxState = store.getState();
  const translate = getTranslateFunction(reduxState);

  const queryParams = getQueryParams(reduxState);

  const track = legacyPlayerState.getTrack();
  const reduxTrack =
    track ? get(reduxState, ['tracks', 'tracks', track.get('id')!]) : {};
  const station = legacyPlayerState.getStation();

  const isGraceNoteAdvert = legacyPlayerState.getIsGraceNoteAdvert();

  if (!station) return null;

  const isEpisode = track && track.get('type') === 'episode';
  const isOnDemandTrack = !!track && getIsOnDemandTrack(track.toJSON());
  const stationType = station.get('seedType') as StationTypeValue;
  const stationId = station.get('seedId');
  const artistId = (station as AlbumStation).get('artistId');
  const trackId = track && track.get('id');
  const playbackType = getPlaybackType(track, stationType);
  const liveMetaData = legacyPlayerState.getMetaData();

  const sourceDescription = station.get('description');
  const sourceUrl = resolveStationUrl(station.toJSON());

  const companionAd = !!getCompanion(reduxState);
  let adIsPlaying = companionAd;

  if (stationType === STATION_TYPE.LIVE) {
    adIsPlaying = isAdPlaying(liveMetaData, isGraceNoteAdvert);
  }

  const trackName =
    track &&
    resolveTrackName(track.get('type'), track.get('title'), companionAd);
  const trackUrl = track && Number(trackId) > -1 ? track.get('url') : undefined;
  const trackDescription =
    !companionAd && track && resolveTrackDescription(track.toJSON());
  const trackDescriptionUrl =
    !companionAd && track && resolveTrackDescriptionUrl(track.toJSON());

  const episodeUrl = isEpisode ? trackDescriptionUrl : undefined;
  const episodeListUrl = `${sourceUrl}/episodes`.replace(
    '//episodes',
    '/episodes',
  );
  const artistUrl = !isEpisode ? trackDescriptionUrl : undefined;

  const trackLyricsId = track && track.get('lyricsId');
  const reduxLyricsId = reduxTrack && get(reduxTrack, 'lyricsId');
  const lyricsId = trackLyricsId || reduxLyricsId;
  const hasLyrics = track && lyricsId && lyricsId !== -1;
  const lyricsUrl = !isEpisode && hasLyrics ? trackUrl : undefined;

  const saveTrackEnabled =
    !!trackId &&
    Number(trackId) > -1 &&
    isOnDemandTrack &&
    getStationSaveable(station.toJSON()) &&
    showSaveTrackPlayerSelector(reduxState);

  const playbackState = getPlaybackState(legacyPlayerState.getPlayingState());

  const mainLine = getTextUrlPair(
    trackName,
    trackUrl,
    playbackState === 'PLAYING' ? translate('Thanks for listening!') : '',
    sourceUrl,
  );
  const descriptionLine = getTextUrlPair(
    trackDescription,
    trackDescriptionUrl,
    sourceDescription,
    sourceUrl,
  );

  const replayableTracks = replayStore.getState().filter(Boolean);

  return {
    addToPlaylistEnabled: isOnDemandTrack,
    artistId,
    artistUrl,
    baseImageUrl: getBaseImageUrl(reduxState, track, station, adIsPlaying),
    callLetters: station.get('callLetters'),
    canReplay:
      replayableTracks.length > 0 &&
      legacyPlayerState.getPlayingState() !== 'IDLE',
    collection: station.get('playlist'),
    // IHRWEB-15411 should only be set to true by Ads Controller which is disabled under Web-Ads 2.0 Feature Flag (MP)
    companionAd,
    descriptionText: descriptionLine.text,
    descriptionUrl: descriptionLine.url,
    episodeListUrl,
    episodeUrl,
    hasSeekbar: [
      'CUSTOM',
      'REPLAY',
      'MY_MUSIC',
      'ALBUM',
      'PLAYLIST',
      'PODCAST',
    ].includes(playbackType),
    isLoggedOut: getIsLoggedOut(reduxState),
    isReplay: playbackType === 'REPLAY',
    liveMetaData,
    audioAdProvider: station.get('ads')?.audio_ad_provider,
    adswizzZones: station.get('adswizzZones'),
    lyricsUrl,
    mainText: mainLine.text,
    mainUrl: mainLine.url,
    markets: station.get('markets'),
    name: station.get('title'),
    owner: (station as PlaylistRadioStation).get('author'),
    playbackState,
    playbackType,
    playedFrom: getPlayedFrom(station, queryParams),
    profileId: legacyPlayerState.get('creds').profileId,
    saveTrackEnabled,
    seekbarReadOnly: !getCanScrub(reduxState, playbackType),
    sentiment: getTracksThumbsSentiments(reduxState)[trackId!],
    shareEnabled: getStationShareable(station.toJSON()),
    showReplay: showReplaySelector(reduxState),
    sourceName: resolveStationName(
      stationType,
      getStationName(station.toJSON(), reduxState),
    ),
    sourceTypeName: getSourceTypeName(translate)[stationType],
    sourceUrl,
    stationId,
    stationFormat: station.get('format'),
    stationProvider: station.get('provider'),
    stationType,
    thumbable: Number.parseInt(String(trackId), 10) > -1,
    trackId: track ? track.get('id') : null,
    trackName: track ? track.get('title') : null,
  };
}
