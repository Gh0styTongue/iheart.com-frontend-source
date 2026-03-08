import analytics from 'modules/Analytics';
import PlaylistTypes from 'constants/playlistTypes';
import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import {
  CREATE_MY_MUSIC_COLLECTION,
  GET_MY_MUSIC_COLLECTIONS,
  REMOVE_MY_MUSIC_COLLECTION,
} from './constants';
import {
  createMyMusicCollection as createMyMusicCollectionService,
  getMyMusicCollections as getMyMusicCollectionsService,
  removeMyMusicCollection as removeMyMusicCollectionService,
} from './services';
import { getpersonalizedPlaylistRecs } from 'state/Features/selectors';
import { getPlaylist } from 'state/Playlist/selectors';
import { getProfileId, getSessionId } from 'state/Session/selectors';
import { pick } from 'lodash-es';
import { Playlist } from 'state/Playlist/types';
import { receivedPlaylists } from 'state/Playlist/actions';
import { SaveDeleteAction } from 'modules/Analytics/helpers/saveDelete';
import { Thunk } from 'state/types';

export function createMyMusicCollection({
  name,
  tracks,
}: {
  name: string;
  tracks: Array<number>;
}): Thunk<Promise<void>> {
  return function createMyMusicCollectionThunk(dispatch, getState, { logger }) {
    const state = getState();
    const profileId = getProfileId(state);
    return transport(
      createMyMusicCollectionService({
        name,
        profileId,
        sessionId: getSessionId(state),
        tracks,
      }),
    )
      .then(({ data: collection }) => {
        const {
          curated,
          id,
          name: playlistName,
          type,
          userId,
        } = collection.data;

        analytics.trackCreateContent!({
          collection: pick(collection.data, [
            'curated',
            'id',
            'type',
            'userId',
          ]),
          id,
          name,
          profileId: profileId!,
          type: 'collection',
        });

        dispatch(receivedPlaylists([collection.data]));
        dispatch({
          meta: {
            analytics: () =>
              analytics.trackSaveDelete!({
                action: SaveDeleteAction.SavePlalist,
                collection: {
                  curated,
                  id,
                  type,
                  userId,
                },
                id,
                name: playlistName,
                profileId: profileId!,
                type: 'collection',
              }),
          },
          payload: [collection.data],
          type: CREATE_MY_MUSIC_COLLECTION,
        });
        /* This is returned for legacy callback purposes. */
        return collection.data;
      })
      .catch((error: any) => {
        const errObj = error instanceof Error ? error : new Error(error);
        logger.error(
          [CONTEXTS.REDUX, CREATE_MY_MUSIC_COLLECTION],
          error,
          {},
          errObj,
        );
        throw errObj; // rethrow so we can handle in modal
      });
  };
}

export function getMyMusicCollections(
  limit?: number,
  pageKey?: string | null,
): Thunk<Promise<void>> {
  return function getMyMusicCollectionsThunk(dispatch, getState, { logger }) {
    const state = getState();
    const profileId = getProfileId(state);
    const sessionId = getSessionId(state);
    const includePersonalized = getpersonalizedPlaylistRecs(state) ?? false;
    return transport(
      getMyMusicCollectionsService({
        limit,
        pageKey,
        profileId,
        sessionId,
        includePersonalized,
      }),
    )
      .then(({ data }) => {
        /* 
        THIS IS BAD! This is because AMP cannot/will not change the value of My Playlist `premium`
        flag to be correctly set to false [DEM 02/17/2021]
        Also - `writable` is initially set to false (even though it technically isn't false), so
        flip that flag too (I hate this, I'm so sorry 😂) Remove when https://ihm-it.atlassian.net/browse/IHRAMP-8227
        is resolved [DEM 04/20/2021]
        */
        const playlists =
          data?.data?.reduce((acc: Array<Playlist>, playlist: Playlist) => {
            const transformedPlaylist = { ...playlist };
            if (
              playlist.type === PlaylistTypes.Default &&
              Number(playlist.userId) === profileId
            ) {
              transformedPlaylist.premium = false;
              transformedPlaylist.writeable = true;
            }
            acc.push(transformedPlaylist);
            return acc;
          }, []) ?? [];
        const nextPageKey = data?.links?.nextPageKey ?? undefined;
        dispatch(receivedPlaylists(playlists, nextPageKey));
        dispatch({
          payload: playlists,
          type: GET_MY_MUSIC_COLLECTIONS,
        });
      })
      .catch((error: any) => {
        const errObj = error instanceof Error ? error : new Error(error);
        logger.error(
          [CONTEXTS.REDUX, GET_MY_MUSIC_COLLECTIONS],
          error,
          {},
          errObj,
        );
      });
  };
}

export function removeMyMusicCollection({
  id,
  userId,
}: {
  id: string;
  userId: number;
}): Thunk<Promise<void>> {
  return function removeMyMusicPlaylistThunk(dispatch, getState, { logger }) {
    const state = getState();
    const { curated, name, type } = getPlaylist(state, {
      seedId: `${userId}/${id}`,
    });
    const profileId = getProfileId(state);
    return transport(
      removeMyMusicCollectionService({
        id,
        profileId,
        sessionId: getSessionId(state),
        userId,
      }),
    )
      .then(() =>
        dispatch({
          meta: {
            analytics: () =>
              analytics.trackSaveDelete!({
                action: SaveDeleteAction.DeletePlaylist,
                collection: {
                  curated,
                  id,
                  type,
                  userId,
                },
                id,
                name,
                profileId: profileId!,
                type: 'collection',
              }),
          },
          payload: { id, userId },
          type: REMOVE_MY_MUSIC_COLLECTION,
        }),
      )
      .catch((error: any) => {
        const errObj = error instanceof Error ? error : new Error(error);
        logger.error(
          [CONTEXTS.REDUX, REMOVE_MY_MUSIC_COLLECTION],
          error,
          {},
          errObj,
        );
      });
  };
}
