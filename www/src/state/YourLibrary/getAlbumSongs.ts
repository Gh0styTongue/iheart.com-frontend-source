import composeRequest, {
  authHeaders,
  header,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import getSongs from 'state/YourLibrary/getSongs';
import { CONTEXTS } from 'modules/Logger';
import { createSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { identity } from 'lodash-es';
import { receivedTracks } from 'state/Tracks/actions';
import type { Track as Song } from 'state/Tracks/types';
import type { State, Thunk } from 'state/types';

const constant = 'YOUR_LIBRARY:GET_ALBUM_SONGS';

export type Params = {
  albumId: number;
  nextPageKey?: string | null;
};

function service({
  albumId,
  nextPageKey,
}: Params): Thunk<
  Promise<{ albumId: number; nextPageKey: string | null; songs: any }>
> {
  return async function thunk(_dispatch, getState, { transport }) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);

    const response = await transport(
      composeRequest(
        authHeaders(profileId, sessionId),
        header('Accept', 'application/json'),
        method('get'),
        nextPageKey ? query({ pageKey: nextPageKey }) : identity,
        urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
          profileId: String(profileId),
        }}/mymusic/albums/${{ id: String(albumId) }}`,
      )(),
    );

    const { data, links } = response.data;

    return {
      albumId,
      nextPageKey: links ? links.nextPageKey : null,
      songs: data,
    };
  };
}

function action(params: Params): Thunk<Promise<string>> {
  return async function thunk(dispatch, _getState, { logger }) {
    try {
      const data = await dispatch(service(params));
      dispatch(receivedTracks(data.songs));
      dispatch({ payload: data, type: constant });
      return data.nextPageKey;
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}

const selectAlbumSongs = createSelector<
  State,
  { albumId: string | number },
  string | number,
  Array<Song>,
  string | null,
  Array<Song>
>(
  (_state, props) => props.albumId,
  getSongs.selectors.selectSongs,
  getSlugId,
  (albumId, songs, slugId) =>
    songs
      .filter(song => song.albumId === (albumId || slugId))
      .sort((a, b) => {
        if (a.volume! < b.volume!) return -1;
        if (a.volume! > b.volume!) return 1;
        if (a.trackNumber! < b.trackNumber!) return -1;
        if (a.trackNumber! > b.trackNumber!) return 1;
        return 0;
      }),
);

export default {
  action,
  constant,
  selectors: {
    selectAlbumSongs,
  },
};
