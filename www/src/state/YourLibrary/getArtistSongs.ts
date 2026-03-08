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
import { Selector, Thunk } from 'state/types';
import { Track as Song } from 'state/Tracks/types';

const constant = 'YOUR_LIBRARY:GET_ARTIST_SONGS';

export type Params = {
  artistId: number;
  nextPageKey?: string | null;
};

function service({
  artistId,
  nextPageKey,
}: Params): Thunk<
  Promise<{ artistId: number; nextPageKey: string | null; songs: any }>
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
        }}/mymusic/artists/${{ id: String(artistId) }}`,
      )(),
    );

    const { data, links } = response.data;

    return {
      artistId,
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

const selectArtistSongs: Selector<Array<Song>> = createSelector(
  // @ts-ignore
  (_state, props) => props.artistId,
  getSongs.selectors.selectSongs,
  getSlugId,
  (artistId, songs, slugId) =>
    songs
      // @ts-ignore
      .filter(song => song.artistId === (artistId || slugId))
      .sort((a, b) => {
        if (a.albumId < b.albumId) return 1;
        if (a.albumId > b.albumId) return -1;
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
    selectArtistSongs,
  },
};
