import { customStationTypes } from './constants';
import { get, merge, setWith } from 'lodash-es';
import { getArtistUrl } from 'utils/url';
import { mapArtists, receiveArtists as receiveArtistsHelper } from './helpers';
import { STATION_TYPE } from 'constants/stationTypes';

export const initialState = { artists: {} };

export function articleLoaded(state, payload) {
  if (get(payload, ['resource', 'type']) !== 'artist') return state;

  return setWith(
    merge({}, state),
    ['artists', String(get(payload, ['resource', 'id'])), 'articles'],
    get(payload, 'articles').map(article => article.slug),
    Object,
  );
}

export function receiveAdGenre(state, payload) {
  return setWith(
    merge({}, state),
    ['artists', String(get(payload, 'artistId')), 'adGenre'],
    get(payload, 'adswizzGenre'),
    Object,
  );
}

export function receiveAllStationTypes(state, payload) {
  return receiveArtistsHelper(
    merge({}, state),
    mapArtists(
      payload.filter(station =>
        customStationTypes.includes(station.stationType),
      ),
    ),
  );
}

export function receiveArtists(state, { artistData }) {
  return receiveArtistsHelper(merge({}, state), artistData);
}

export function receiveProfile(
  state,
  {
    artist = {},
    latestRelease = {},
    tracks = [],
    albums = [],
    popularOnStations = [],
    relatedTo = [],
  },
) {
  const { artistId } = artist;

  return {
    artists: merge({}, state.artists, {
      [String(artistId)]: {
        albums,
        latestRelease,
        popularOnStations,
        relatedArtists: relatedTo,
        tracks,
      },
    }),
  };
}

export function receiveSimilars(state, { artistId, similars }) {
  const similarsMap = similars.reduce(
    (memo, similar) => ({
      ...memo,
      [String(similar.artistId)]: {
        ...similar,
        id: similar.stationId,
        image: similar.link,
        name: similar.artistName,
      },
    }),
    {},
  );

  return merge(
    {},
    state,
    setWith(
      {},
      [String(artistId), 'similars'],
      similars.map(({ artistId: aid }) => aid),
      Object,
    ),
    similarsMap,
  );
}

export function removeStation(state, { seedId, stationType }) {
  if (stationType !== STATION_TYPE.ARTIST) return state;

  return merge(
    {},
    state,
    setWith({}, ['artists', String(seedId), 'lastPlayedDate'], null, Object),
  );
}

export function saveStation(state, { seedType, seedId, data }) {
  const { id: stationId } = data;
  if (seedType === STATION_TYPE.ARTIST) {
    return receiveArtistsHelper(merge({}, state), [
      {
        ...data,
        artistId: seedId,
        seedId,
        seedType,
        stationId,
        url: getArtistUrl(seedId, data.name),
      },
    ]);
  }
  return state;
}

export function setIsFavorite(state, { artistId, isFavorite }) {
  return setWith(
    merge({}, state),
    ['artists', String(artistId), 'favorite'],
    isFavorite,
    Object,
  );
}

export function setLastPlayedDate(state, { seedType, seedId, timestamp }) {
  return seedType === STATION_TYPE.ARTIST ?
      setWith(
        merge({}, state),
        ['artists', String(seedId), 'lastPlayedDate'],
        timestamp,
        Object,
      )
    : state;
}

export function updateThumbs(
  state,
  { trackId, sentiment, stationType, seedId },
) {
  if (stationType === STATION_TYPE.ARTIST) {
    return setWith(
      merge({}, state),
      ['artists', String(seedId), 'thumbs', String(trackId)],
      sentiment,
      Object,
    );
  }

  return state;
}
