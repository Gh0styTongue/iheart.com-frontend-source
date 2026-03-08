import transport from 'api/transport';
import { getAlbumByIdV3, getArtistAlbums } from 'state/Albums/services';
import { getAmpUrl } from 'state/Config/selectors';
import {
  RECEIVE_ADDITIONAL_ALBUMS,
  RECEIVE_ALBUM,
  RECEIVE_ALBUMS,
} from './constants';
import { Track } from 'state/Tracks/types';
import type { Album } from './types';
import type { Thunk } from 'state/types';

export function albumReceived(albumData: Album | Array<Album>) {
  return {
    payload: Array.isArray(albumData) ? albumData : [albumData],
    type: RECEIVE_ALBUM,
  };
}

export function requestAlbum({
  albumId,
}: {
  albumId: number;
}): Thunk<Promise<Album>> {
  return function thunk(dispatch, getState) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    return transport(
      getAlbumByIdV3({
        albumId,
        ampUrl,
      }),
    ).then(({ data }) => {
      dispatch(albumReceived(data));
      return data;
    });
  };
}

export function artistAlbumsReceived(
  artistId: number,
  albumData: Array<Track>,
) {
  return {
    payload: { albumData, artistId },
    type: RECEIVE_ALBUMS,
  };
}

export function artistAdditionalAlbumsReceived(
  artistId: number,
  albumData: Array<Track>,
) {
  return {
    payload: { albumData, artistId },
    type: RECEIVE_ADDITIONAL_ALBUMS,
  };
}

export function requestAdditionalAlbums(
  id: number,
  next: string,
): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    // @ts-ignore
    return transport(getArtistAlbums({ ampUrl, id, next })).then(({ data }) => {
      dispatch(artistAdditionalAlbumsReceived(id, data));
    });
  };
}
