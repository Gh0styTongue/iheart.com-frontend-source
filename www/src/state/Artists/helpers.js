import { get, merge } from 'lodash-es';
import { resolve as resolveUrl } from 'url';
import { slugify } from 'utils/string';
import { STATION_TYPE } from 'constants/stationTypes';

export function mapArtists(artists) {
  return artists.map(artist => ({
    artistId: artist.seedArtistId,
    stationId: artist.id,
    ...artist,
  }));
}

export function mapTracks(tracks = []) {
  return tracks.map(track => ({
    ...track,
    imageUrl: `https://image.iheart.com${track.imageUrl}`, // AGILEAMP-1718 suppose to fix the issue of returning imgUrl without host
    title: track.title || track.name,
  }));
}

export function receiveArtists(state, artistData) {
  const reduced = artistData.reduce(
    (aggr, artist) => ({
      ...aggr,
      [artist.artistId]: {
        ...artist,
        id: artist.stationId,
        seedId: artist.artistId || artist.seedId || artist.seedArtistId,
        seedType: STATION_TYPE.ARTIST,
        thumbs: merge(
          {},
          get(state, ['artists', String(artist.artistId), 'thumbs'], {}),
          artist.thumbsDown ?
            artist.thumbsDown.reduce(
              (aggregate, id) => ({ ...aggregate, [id]: -1 }),
              {},
            )
          : {},
          artist.thumbsUp ?
            artist.thumbsUp.reduce(
              (aggregate, id) => ({ ...aggregate, [id]: 1 }),
              {},
            )
          : {},
        ),
        tracks:
          artist.tracks ?
            mapTracks(artist.tracks)
          : get(state, ['artists', String(artist.artistId), 'tracks'], []),
      },
    }),
    {},
  );

  return {
    artists: merge({}, state.artists, reduced),
  };
}

export function getAlbumUrl({ artistUrl, albumId, albumName }) {
  if (!artistUrl || !albumId) {
    return null;
  }

  return resolveUrl(artistUrl, `albums/${slugify(albumName)}-${albumId}/`);
}

const VARIETY = ['TOP_HITS', 'MIX', 'VARIETY'];

export function getSimilarArtistVarietyMap(artists = []) {
  return artists.reduce((varietyMap, artist) => {
    const variety = VARIETY[artist.variety - 1];
    return {
      ...varietyMap,
      [variety]: [...(varietyMap[variety] || []), artist],
    };
  }, {});
}
