import { capitalize, get } from 'lodash-es';
import { getAlbumUrl, getArtistUrl } from 'utils/url';
import { getCollectionImageUrl, isPlaylist } from 'state/Playlist/helpers';
import { getFavoritesRadioName } from 'state/Favorites/helpers';
import { getName } from 'state/Favorites/selectors';
import { getPodcastUrl } from 'state/Podcast/helpers';
import { isModel } from 'utils/immutable';
import { slugify } from 'utils/string';
import { STATION_TYPE } from 'constants/stationTypes';

export const trackIsSpotblock = type => ['adswizz', 'synced'].includes(type);

export const trackIsSong = track => {
  if (!isModel(track)) return false;

  const type = track.get('type');
  const isMedia = track.get('isMedia');
  const id = track.get('id') || track.get('trackId');

  return !!isMedia && !trackIsSpotblock(type) && !!id;
};

export const resolveStationType = stationType => {
  const resolutions = {
    [STATION_TYPE.LIVE]: 'Live Radio',
    [STATION_TYPE.ARTIST]: 'Artist Radio',
    [STATION_TYPE.TRACK]: 'Artist Radio',
    [STATION_TYPE.FEATURED]: 'Theme Radio',
    mood: 'Theme Radio',
    [STATION_TYPE.FAVORITES]: 'Favorites Radio',
    [STATION_TYPE.COLLECTION]: 'Playlist',
    [STATION_TYPE.PLAYLIST_RADIO]: 'Playlist',
    [STATION_TYPE.ALBUM]: 'Album',
    [STATION_TYPE.MY_MUSIC]: 'Your Library',
    [STATION_TYPE.PODCAST]: 'Podcast',
  };

  return resolutions[stationType] || '';
};

export const getStationName = (station, reduxState) => {
  const seedType = get(station, 'seedType');

  if (seedType === STATION_TYPE.FAVORITES) {
    return getName(reduxState) || get(station, 'name');
  }

  if (seedType === STATION_TYPE.MY_MUSIC) {
    const myMusicType = get(station, 'myMusicType');

    return myMusicType ? capitalize(`${myMusicType}s`) : '';
  }

  if (seedType === 'podcast') {
    return get(station, 'title');
  }

  return get(station, 'name');
};

export const resolveStationName = (seedType, stationName) => {
  const radioAppendixWhitelist = [
    STATION_TYPE.CUSTOM,
    STATION_TYPE.TRACK,
    STATION_TYPE.ARTIST,
  ];

  if (seedType === STATION_TYPE.MY_MUSIC) {
    return 'Your Library';
  }

  if (seedType === STATION_TYPE.FAVORITES) {
    return getFavoritesRadioName(stationName);
  }

  return `${stationName} ${
    radioAppendixWhitelist.includes(seedType) ? 'Radio' : ''
  }`;
};

export const resolveTrackName = (type, title, isCompanionAd) => {
  const showStationThanks = ['preroll', 'instream', 'adswizz', 'synced'];
  return showStationThanks.includes(type) || isCompanionAd ?
      'Thanks for listening!'
    : title;
};

export const resolveTrackImg = track =>
  track.get('companions') ? track.get('companions').albumArt : null;

export const resolveTrackDescription = (track = {}) => {
  const { artistName, show, description, artist } = track;

  return artistName || show || description || artist;
};

export const resolveTrackDescriptionUrl = (track = {}) => {
  if (get(track, 'type') === 'episode') {
    return get(track, 'url');
  }

  const artistId = get(track, 'artistId');

  return artistId && Number(artistId) > -1 ?
      getArtistUrl(artistId, get(track, 'artist') || get(track, 'artistName'))
    : null;
};

export const resolveStationUrl = station => {
  const seedType = get(station, 'seedType');
  if (seedType === STATION_TYPE.ALBUM) {
    return getAlbumUrl(
      get(station, 'artistId'),
      get(station, 'artist'),
      get(station, 'albumId'),
      get(station, 'name'),
    );
  }
  if (seedType === STATION_TYPE.PODCAST) {
    return getPodcastUrl(
      get(station, 'seedId'),
      get(station, 'slug') || slugify(get(station, 'name')),
    );
  }
  if (get(station, 'type') === STATION_TYPE.MY_MUSIC) {
    return '/your-library/';
  }
  return get(station, 'url');
};

export function getStationImage(station, mediaServerUrl, siteUrl) {
  const {
    type: stationType,
    id: stationId,
    seedType,
    seedId,
    imageUrl,
    imgUrl,
    rawLogo,
  } = station.attrs;
  const type =
    (seedType || stationType) === 'mood' ?
      STATION_TYPE.FEATURED
    : seedType || stationType;
  if (
    isPlaylist(stationType) &&
    station.get('playlist') &&
    station.get('playlist').totalTracks >= 4
  ) {
    return {
      catalogId: seedId || stationId,
      catalogType: type,
      imgUrl: getCollectionImageUrl(
        { mediaServerUrl, siteUrl },
        { tiles: 2 },
        imgUrl || imageUrl,
      ),
    };
  }

  return {
    catalogId: seedId || stationId,
    catalogType: type,
    imgUrl: rawLogo || imgUrl || imageUrl,
  };
}

export function resolveArtProps(
  track = { attrs: {} },
  station = { attrs: {} },
  adIsPlaying,
  mediaServerUrl,
  siteUrl,
) {
  const {
    companions,
    type: trackType,
    id: trackId,
    imageUrl: imgUrl,
  } = track.attrs;
  if (trackIsSpotblock(trackType) || adIsPlaying) {
    return getStationImage(station, mediaServerUrl, siteUrl);
  }

  if (companions?.albumArt ?? false) {
    return { imgUrl: companions.albumArt };
  }

  if (trackId && trackId > -1 && trackType) {
    return {
      catalogId: trackId,
      catalogType: trackType,
      imgUrl,
    };
  }

  return getStationImage(station, mediaServerUrl, siteUrl);
}
