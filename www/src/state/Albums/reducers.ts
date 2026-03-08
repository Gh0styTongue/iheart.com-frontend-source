import { Album, AlbumsPayload, State } from './types';
import { get, merge } from 'lodash-es';

export function addAlbum(state: State, payload: Array<Album>) {
  return {
    ...state,
    albums: payload.reduce(
      (acc, album) =>
        merge({}, acc, {
          [String(album.albumId || album.id)]: {
            ...album,
            seedId: album.albumId,
          },
        }),
      merge({}, state.albums),
    ),
  };
}

export function addAlbums(
  state: State,
  { artistId, albumData: { data: albums, links } }: AlbumsPayload,
): State {
  if (state[artistId] && state[artistId].albums) {
    return state;
  }
  return merge({}, state, {
    [artistId]: {
      albums,
      links: { next: get(links, 'next', '') },
    },
  });
}

export function addAdditionalAlbums(
  state: State,
  { artistId, albumData: { data: albums, links } }: AlbumsPayload,
) {
  return merge({}, state, {
    [artistId]: {
      albums: [...get(state[artistId], 'albums', []), ...albums],
      links: { next: get(links, 'next', '') },
    },
  });
}
