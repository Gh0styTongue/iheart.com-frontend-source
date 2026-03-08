import analytics from 'modules/Analytics';
import PlaylistTypes from 'constants/playlistTypes';
import transport from 'api/transport';
import {
  ADD_TRACKS_TO_PLAYLIST,
  DELETE_PLAYLIST,
  DELETE_TRACKS,
  FOLLOW_MY_MUSIC_PLAYLIST_ID,
  FOLLOW_PLAYLIST_ID,
  RECEIVED_PLAYLISTS,
  REMOVE_PLAYLIST_FROM_HISTORY,
  REQUEST_STATE,
  SET_PLAYLIST_REQUEST_STATE,
  SHUFFLE_PLAYLIST,
  TOGGLE_FOLLOW,
  UNFOLLOW_MY_MUSIC_PLAYLIST_ID,
  UNFOLLOW_PLAYLIST_ID,
  UPDATE_PLAYLIST_NAME,
  UPDATE_TRACK_ORDER,
} from './constants';
import {
  addTracksToPlaylist as addTracksToPlaylistService,
  deleteTracksFromPlaylist,
  followPlaylist,
  getPlaylist,
  getPlaylistRecs as getPlaylistRecsWithAuth,
  getUserPlaylists,
  unfollowPlaylist,
  updatePlaylist,
} from './services';
import { AxiosPromise } from 'axios';
import { ConnectedModals } from 'state/UI/constants';
import { CONTEXTS } from 'modules/Logger';
import { encodePlaylistSeedId } from 'state/Playlist/helpers';
import { get } from 'lodash-es';
import { getAlbumTracks } from 'state/Albums/selectors';
import { getAllAccessPreview } from 'state/Entitlements/selectors';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getCredentials,
  getIsAnonymous,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import {
  getCurrentOwnerId,
  getCurrentPlaylist,
  getCurrentPlaylistId,
} from './selectors';
import {
  getFreeUserMyPlaylistEnabled,
  getRecommendedPlaylistRecs,
} from 'state/Features/selectors';
import {
  getMyMusicCollectionById,
  getMyMusicCollectionByType,
} from 'state/MyMusic/selectors';
import { getMyMusicCollections } from 'state/MyMusic/actions';
import { getTrackById } from 'state/Tracks/selectors';
import { getUserType } from 'state/User/selectors';
import { navigate } from 'state/Routing/actions';
import { openModal, openSignupModal } from 'state/UI/actions';
import { PLAYLIST_RECS_CATEGORY_ID } from 'state/Recs/constants';
import { Rec } from 'state/Recs/types';
import { recsReceived } from 'state/Recs/actions';
import { requestAlbum } from 'state/Albums/actions';
import { RequestState } from 'state/Playlist/types';
import {
  SaveDeleteAction,
  SaveDeleteComponent,
  SaveDeleteView,
} from 'modules/Analytics/helpers/saveDelete';
import { State } from 'state/buildInitialState';
import { STATION_TYPE } from 'constants/stationTypes';
import { Thunk } from 'state/types';
import { Track } from 'state/Tracks/types';
import type { CurrentPlaylistType, Playlist } from 'state/Playlist/types';

export function deletePlaylist(ownerId: string, playlistId: string) {
  return {
    payload: { ownerId, playlistId },
    type: DELETE_PLAYLIST,
  };
}

export function unfollowPlaylistId(playlistSeedId: string) {
  return {
    payload: playlistSeedId,
    type: UNFOLLOW_PLAYLIST_ID,
  };
}

export function followPlaylistId(playlistSeedId: string) {
  return {
    payload: playlistSeedId,
    type: FOLLOW_PLAYLIST_ID,
  };
}

export function removePlaylistFromHistory(seedId: string) {
  return {
    payload: { seedId },
    type: REMOVE_PLAYLIST_FROM_HISTORY,
  };
}

export function receivedPlaylists(
  playlists: Array<Playlist>,
  nextPageKey?: string | null | undefined,
  requestState?: RequestState | null | undefined,
) {
  return {
    payload: { nextPageKey, playlists, requestState },
    type: RECEIVED_PLAYLISTS,
  };
}

export function shufflePlaylist({
  curated,
  id,
  name,
  profileId,
  seedId,
  shuffled,
  type,
  userId,
}: {
  curated: boolean;
  id: string;
  name: string;
  profileId: number;
  seedId: string;
  shuffled: boolean;
  type: CurrentPlaylistType;
  userId: number;
}) {
  return {
    meta: {
      analytics: () =>
        analytics.trackShuffle!({
          action: shuffled ? 'unshuffle' : 'shuffle',
          collection: { curated, id, type, userId },
          id,
          name,
          profileId,
          type: 'collection',
        }),
    },
    payload: { seedId },
    type: SHUFFLE_PLAYLIST,
  };
}

export function updateTrackOrder(
  seedId: string,
  tracks: Array<Track | undefined>,
) {
  return {
    payload: { seedId, tracks },
    type: UPDATE_TRACK_ORDER,
  };
}

export function setPlaylistRequestState({
  playlistId,
  ownerId,
  requestState,
}: Readonly<{
  ownerId: string;
  playlistId: string;
  requestState: RequestState;
}>) {
  return {
    payload: { ownerId, playlistId, requestState },
    type: SET_PLAYLIST_REQUEST_STATE,
  };
}

type RequestPlaylistData = {
  playlistId: string;
  playlistUserId: string;
};

type RequestPlaylistReturn = Promise<ReturnType<typeof receivedPlaylists>>;

export function requestPlaylist({
  playlistId,
  playlistUserId,
}: RequestPlaylistData): Thunk<RequestPlaylistReturn> {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const profileId = getProfileId(state);
    const sessionId = getSessionId(state);
    const userType = getUserType(state);
    dispatch(
      setPlaylistRequestState({
        ownerId: String(playlistUserId),
        playlistId,
        requestState: REQUEST_STATE.PENDING,
      }),
    );
    return transport(
      getPlaylist({
        ampUrl,
        playlistId,
        playlistUserId: Number(playlistUserId),
        profileId,
        sessionId,
      }),
    )
      .then(({ data }) => {
        /* 
        THIS IS BAD! This is because AMP cannot/will not change the value of My Playlist `premium`
        flag to be correctly set to false [DEM 02/12/2021]
        */
        const playlist = { ...data };
        if (playlist.type === PlaylistTypes.Default && userType === 'FREE') {
          playlist.premium = false;
        }
        return dispatch(receivedPlaylists([playlist]));
      })
      .catch((err: any) => {
        const errObj =
          err instanceof Error ? err : new Error(err.statusText ?? 'error');
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.PLAYLIST],
          errObj.message,
          {},
          errObj,
        );
        dispatch(
          setPlaylistRequestState({
            ownerId: String(playlistUserId),
            playlistId,
            requestState:
              get(err, ['response', 'status'], 0) === 401 && !__CLIENT__ ?
                REQUEST_STATE.NEEDS_AUTH
              : REQUEST_STATE.FAILED,
          }),
        );
        throw errObj;
      });
  };
}

export function requestRelatedPlaylists(
  relatedPlaylistIds: Array<string>,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { logger }) => {
    if (!relatedPlaylistIds) return;
    const state = getState();
    const ampUrl = getAmpUrl(state);

    const relatedPlaylistData = await Promise.all(
      relatedPlaylistIds.map(async playlistId => {
        let playlist = {};
        const [owner, id] = playlistId.split('::');
        try {
          playlist = await transport(
            getPlaylist({
              ampUrl,
              playlistId: id,
              playlistUserId: Number(owner),
              profileId: null,
              sessionId: null,
            }),
          );
        } catch (e: any) {
          const errObj =
            e instanceof Error ? e : new Error(e.statusText ?? 'error');
          logger.error(
            [CONTEXTS.ROUTER, CONTEXTS.PODCAST],
            errObj.message,
            {},
            errObj,
          );
        }
        return get(playlist, 'data', {});
      }),
    );
    dispatch(receivedPlaylists(relatedPlaylistData));
  };
}

export type RequestPlaylist = (
  data: RequestPlaylistData,
) => RequestPlaylistReturn;

export function deleteTracks(
  ids: Array<string>,
  seedId: string,
  state: State,
  trackIds: Array<number>,
) {
  return {
    meta: {
      analytics: () =>
        trackIds.forEach(trackId => {
          const track = getTrackById(state, { trackId });
          analytics.trackSaveDelete!({
            action: SaveDeleteAction.DeleteFromPlaylist,
            id: track.artistId,
            name: track.artistName,
            trackId,
            trackTitle: track.title!,
            type: 'track',
            trackArtistId: track.artistId,
            trackArtistName: track.artistName,
          });
        }),
    },
    payload: { ids, seedId },
    type: DELETE_TRACKS,
  };
}

export function removeTracksFromPlaylist(
  ids: Array<string>,
): Thunk<AxiosPromise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const profileId = getProfileId(state);
    const sessionId = getSessionId(state);
    const playlistId = getCurrentPlaylistId(state);
    const playlistUserId = getCurrentOwnerId(state);
    const playlist = getCurrentPlaylist(state);
    const { tracks, seedId } = playlist;
    const matchedTracks = ids.map(id =>
      tracks.find((track: { id: any }) => String(track.id) === id),
    ) as Array<Track>;
    const matchedTrackIds = matchedTracks.map(track => get(track, 'trackId'));
    const matchedIds = matchedTracks.map(track => get(track, 'id'));

    dispatch(deleteTracks(ids, seedId, state, matchedTrackIds));

    return transport(
      deleteTracksFromPlaylist({
        ampUrl,
        playlistId,
        playlistUserId,
        profileId,
        sessionId,
        trackIds: matchedIds,
      }),
    );
  };
}

export function reorderTracks(
  newOrder: Array<{
    id: number;
  }>,
): Thunk<AxiosPromise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const profileId = getProfileId(state);
    const sessionId = getSessionId(state);
    const playlistId = getCurrentPlaylistId(state);
    const playlistUserId = getCurrentOwnerId(state);
    const playlist = getCurrentPlaylist(state);
    const { seedId, tracks } = playlist;

    dispatch(
      updateTrackOrder(
        seedId,
        newOrder.map(({ id }: { id: number }) =>
          tracks.find(({ trackId }) => trackId === id),
        ),
      ),
    );

    return transport(
      updatePlaylist({
        ampUrl,
        playlistId,
        playlistUserId: Number(playlistUserId),
        profileId,
        sessionId,
        updateData: {
          tracks: newOrder.map(({ id }) => ({
            trackId: id,
          })),
        },
      }),
    );
  };
}

export function requestUserPlaylists(limit: number): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const profileId = getProfileId(state);
    const sessionId = getSessionId(state);

    return transport(
      getUserPlaylists({
        ampUrl,
        limit,
        profileId,
        sessionId,
      }),
    ).then(({ data }) => dispatch(receivedPlaylists(data.data)));
  };
}

export function addTracksToPlaylist({
  id,
  tracks,
  userId,
}: {
  id: string;
  tracks: Array<number>;
  type?: string;
  userId: number | null;
  withAnalytics: boolean;
}): Thunk<Promise<void>> {
  return function addTracksToPlaylistThunk(dispatch, getState, { logger }) {
    const state = getState();
    return transport(
      addTracksToPlaylistService({
        ampUrl: getAmpUrl(state),
        playlistId: id,
        playlistUserId: userId,
        profileId: getProfileId(state),
        sessionId: getSessionId(state),
        tracks,
      }),
    )
      .then(res => res.data.data)
      .then(playlist =>
        dispatch({
          payload: {
            id,
            tracks: playlist.tracks,
            userId,
          },
          type: ADD_TRACKS_TO_PLAYLIST,
        }),
      )
      .catch((error: any) => {
        const errObj =
          error instanceof Error ? error : (
            new Error(error.statusText ?? 'error')
          );
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.PLAYLIST, ADD_TRACKS_TO_PLAYLIST],
          errObj.message,
          {},
          errObj,
        );
      });
  };
}

export function updatePlaylistName(name: string): Thunk<Promise<void>> {
  return function updatePlaylistNameThunk(dispatch, getState, { logger }) {
    const state = getState();

    return transport(
      updatePlaylist({
        ampUrl: getAmpUrl(state),
        playlistId: getCurrentPlaylistId(state),
        playlistUserId: Number(getCurrentOwnerId(state)),
        profileId: getProfileId(state),
        sessionId: getSessionId(state),
        updateData: { name },
      }),
    )
      .then(({ data: playlist }) =>
        dispatch(receivedPlaylists([playlist.data])),
      )
      .catch((error: any) => {
        const errObj =
          error instanceof Error ? error : (
            new Error(error.statusText ?? 'error')
          );
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.PLAYLIST, UPDATE_PLAYLIST_NAME],
          errObj.message,
          {},
          errObj,
        );
      });
  };
}

export function toggleFollowPlaylists({
  playlistId,
  playlistUserId,
}: {
  playlistId: string;
  playlistUserId: number | null;
}) {
  return {
    payload: {
      playlistId,
      playlistUserId,
    },
    type: TOGGLE_FOLLOW,
  };
}

export function followMyMusicPlaylistId(id: string): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const collectionIds = get(state, ['myMusic', 'collections', 'ids'], []);
    if (collectionIds.length === 0) {
      return dispatch(getMyMusicCollections()).then(() => {
        dispatch({
          payload: id,
          type: FOLLOW_MY_MUSIC_PLAYLIST_ID,
        });
      });
    }

    return dispatch({
      payload: id,
      type: FOLLOW_MY_MUSIC_PLAYLIST_ID,
    });
  };
}

export function unfollowMyMusicPlaylistId(id: string) {
  return {
    payload: id,
    type: UNFOLLOW_MY_MUSIC_PLAYLIST_ID,
  };
}

export function updateFollowPlaylists({
  followed,
  seedId,
  playlistUserId,
  playlistId,
}: {
  followed: boolean;
  seedId?: number | null;
  playlistId: string;
  playlistUserId: number | null;
}): Thunk<AxiosPromise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const profileId = getProfileId(state);
    const sessionId = getSessionId(state);
    const service = followed ? followPlaylist : unfollowPlaylist;

    dispatch(toggleFollowPlaylists({ playlistId, playlistUserId }));

    const encodedSeedId = encodePlaylistSeedId(
      playlistUserId,
      seedId || playlistId,
    );

    if (followed) {
      dispatch(followMyMusicPlaylistId(encodedSeedId));
      dispatch(followPlaylistId(encodedSeedId));
    } else {
      dispatch(unfollowMyMusicPlaylistId(encodedSeedId));
      dispatch(unfollowPlaylistId(encodedSeedId));
    }

    return transport(
      service({
        ampUrl,
        playlistId,
        playlistUserId,
        profileId,
        sessionId,
      }),
    );
  };
}

export function redirectToPlaylistByType({
  playlistType,
  fallback,
}: {
  fallback: string;
  playlistType: string;
}): Thunk<Promise<void>> {
  return (dispatch, getState, { logger }) =>
    dispatch(getMyMusicCollections())
      .then(() => {
        const playlist = getMyMusicCollectionByType(getState(), {
          playlistType,
        });
        const webUrl = get(playlist, ['urls', 'web'], '');
        return webUrl ? webUrl.split('.com')[1] : fallback;
      })
      .catch((err: any) => {
        const errObj =
          err instanceof Error ? err : new Error(err.statusText ?? 'error');
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.PLAYLIST],
          errObj.message,
          {},
          errObj,
        );
        return fallback;
      })
      .then((path: string) => dispatch(navigate({ path })));
}

export function redirectToPlaylistById({
  playlistId,
  fallback,
}: {
  playlistId: string | number;
  fallback: string;
}): Thunk<Promise<void>> {
  return (dispatch, getState, { logger }) =>
    dispatch(getMyMusicCollections())
      .then(() => {
        const playlist: Playlist = getMyMusicCollectionById(getState(), {
          playlistId,
        });
        const webUrl = playlist?.urls?.web ?? '';
        return webUrl ? webUrl.split('.com')[1] : fallback;
      })
      .catch((err: any) => {
        const errObj =
          err instanceof Error ? err : new Error(err.statusText ?? 'error');
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.PLAYLIST],
          errObj.message,
          {},
          errObj,
        );
        return fallback;
      })
      .then((path: string) => dispatch(navigate({ path })));
}

/**
 * This thunk has the following flow due to DMCA reasons
 * Not Signed In -> RegGate
 * Free / Non-Premium -> Upsell
 * Premium -> Add Album To Playlist
 */
export function addAlbumToPlaylist({
  albumId,
  view,
  component,
}: {
  albumId: number;
  component: SaveDeleteComponent;
  view: SaveDeleteView;
}): Thunk<Promise<void>> {
  return async (dispatch, getState, { logger }) => {
    const state = getState();
    const isAnonymous = getIsAnonymous(state);
    const isAllAccessPreview = getAllAccessPreview(state);
    // This feature now acts as the add to playlist flag
    const isFreeUserMyPlaylist = getFreeUserMyPlaylistEnabled(state);

    if (!isFreeUserMyPlaylist) {
      // If we are calling this thunk, but the flag is not enabled,
      // we are likely showing UI that should not be visible
      logger.error(
        [CONTEXTS.PLAYLIST, 'state/Playlist/actions.addAlbumToPlaylist'],
        new Error(
          'User without add to playlist feature called addAlbumToPlaylist',
        ),
      );

      return;
    }

    // RegGate
    if (isAnonymous) {
      dispatch(
        openSignupModal({
          context: isAllAccessPreview ? 'all_access_Preview' : 'reg-gate',
        }),
      );

      return;
    }

    // Add To Playlist

    let tracks = getAlbumTracks(state, { albumId });

    if (!tracks?.length) {
      const album = await dispatch(requestAlbum({ albumId }));
      if (!album?.tracks?.length) return;

      tracks = album.tracks;
    }

    const trackIds = tracks.map((track: { id: number }) => track.id);

    dispatch(
      openModal({
        id: ConnectedModals.AddToPlaylist,
        context: {
          trackIds,
          view,
          component,
          type: STATION_TYPE.ALBUM,
        },
      }),
    );
  };
}

export function getPlaylistRecs(): Thunk<Promise<void>> {
  return async (dispatch, getState, { logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);
    const includePersonalized = getRecommendedPlaylistRecs(state);
    try {
      const { data }: { data: Array<Rec> & { tiles: Array<{ item: any }> } } =
        await transport(
          getPlaylistRecsWithAuth({
            ampUrl,
            profileId: profileId!,
            sessionId: sessionId!,
            includePersonalized,
          }),
        );
      dispatch(
        recsReceived({
          defaultRecs: false,
          id: PLAYLIST_RECS_CATEGORY_ID,
          recs: data,
          type: 'playlist',
        }),
      );
      const playlists = data.tiles.map(playlist => playlist.item);
      dispatch(receivedPlaylists(playlists));
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
      throw errObj;
    }
  };
}
