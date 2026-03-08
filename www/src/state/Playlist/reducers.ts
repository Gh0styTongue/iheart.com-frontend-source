import UrlParse from 'url-parse';
import {
  encodePlaylistSeedId,
  isPlaylist,
  receivePlaylists,
} from 'state/Playlist/helpers';
import { get, hasIn, merge, setWith, shuffle } from 'lodash-es';
import { Playlist, RequestState, State } from './types';
import { REQUEST_STATE } from 'state/Playlist/constants';
import { Sentiment } from 'state/Stations/types';
import { StationTypeValue } from 'constants/stationTypes';
import { Track } from 'state/Tracks/types';

export function mapPlaylistStation({
  urls,
  playlistId,
  ownerId,
  name,
  author,
  lastPlayedDate,
}: Playlist) {
  const { web, image } = urls ?? {};

  return {
    author,
    deleted: false,
    imgUrl: image,
    lastPlayedDate,
    name,
    ownerId,
    playlistId,
    seedId: encodePlaylistSeedId(ownerId, playlistId),
    url: web ? new UrlParse(web).pathname : null,
  };
}

export const initialState = {
  nextPageKey: undefined,
  playlists: {},
  receivedPlaylists: false,
};

export function resetAllPlaylists() {
  return merge({}, initialState);
}

export function receiveAllStationTypes(state: State, payload: Array<Playlist>) {
  const playlists = payload
    .filter(station => isPlaylist(station.stationType.toLowerCase()))
    .map(mapPlaylistStation);
  return receivePlaylists(state, playlists, REQUEST_STATE.PARTIAL);
}

export function setLastPlayedDate(
  state: State,
  {
    seedType,
    seedId,
    timestamp,
  }: {
    seedId: number;
    seedType: string;
    timestamp: number;
  },
) {
  return isPlaylist(seedType) ?
      merge(
        {},
        state,
        setWith(
          {},
          ['playlists', String(seedId), 'lastPlayedDate'],
          timestamp,
          Object,
        ),
      )
    : state;
}

export function unfollowPlaylistId(state: State, payload: string) {
  return {
    ...state,
    playlists: {
      ...state.playlists,
      [payload]: {
        ...(state?.playlists?.[payload] ?? {}),
        followed: false,
      },
    },
  };
}

export function followPlaylistId(state: State, payload: string) {
  return {
    ...state,
    playlists: {
      ...state.playlists,
      [payload]: {
        ...(state.playlists[payload] || {}),
        followed: true,
      },
    },
  };
}

export function receivedPlaylists(
  state: State,
  payload: {
    nextPageKey?: string | null | undefined;
    playlists: Array<Playlist>;
    requestState?: RequestState | null | undefined;
  },
) {
  const data = receivePlaylists(
    state,
    payload.playlists.map(playlist => {
      const webUrl = get(playlist, ['urls', 'web']);
      return {
        ...playlist,
        deleted: playlist.deleted ?? get(playlist, 'removed', false),
        imgUrl: playlist.imgUrl ?? get(playlist, ['urls', 'image'], ''),
        ownerId: playlist.ownerId ?? playlist.userId,
        playlistId: playlist.id,
        playlistType: playlist.type,
        requestState:
          playlist.requestState ??
          payload.requestState ??
          REQUEST_STATE.FETCHED,
        seedId:
          playlist.seedId ?? encodePlaylistSeedId(playlist.userId, playlist.id),
        thumbs: playlist.thumbs ?? {},
        url: playlist.url ?? (webUrl && new UrlParse(webUrl).pathname),
      };
    }),
    '' as RequestState,
    // @ts-ignore
    payload.nextPageKey,
  );
  return { ...state, ...data, receivedPlaylists: true };
}

export function addTracksToPlaylist(
  state: State,
  payload: {
    id: string;
    tracks: Array<number>;
    userId: number;
  },
) {
  const playlistId = encodePlaylistSeedId(payload.userId, payload.id);
  const playlist = get(state, ['playlists', playlistId]);

  if (!playlist) return state;

  return {
    ...state,
    playlists: {
      ...state.playlists,
      [playlistId]: {
        ...playlist,
        tracks: payload.tracks,
      },
    },
  };
}

export function deletePlaylist(
  state: State,
  {
    playlistId,
    ownerId,
  }: {
    ownerId: string;
    playlistId: string;
  },
) {
  // ownerId left here for when we set this up to index by ownerId and playlistId
  if (hasIn(state, ['playlists', encodePlaylistSeedId(ownerId, playlistId)])) {
    // we don't do a hard delete on playlists because once we add playback for playlists
    // if the deleted playlist is still playing then we need the data for the playlist until the song finishes
    return merge(
      {},
      state,
      setWith(
        {},
        ['playlists', encodePlaylistSeedId(ownerId, playlistId), 'deleted'],
        true,
        Object,
      ),
    );
  }
  return state;
}

export function removePlaylistFromHistory(
  state: State,
  {
    seedId,
  }: {
    seedId: string;
  },
) {
  const playlist = get(state, ['playlists', seedId]);
  if (playlist) {
    // we don't do a hard delete on playlists because once we add playback for playlists
    // if the deleted playlist is still playing then we need the data for the playlist until the song finishes
    return setWith(
      merge({}, state),
      ['playlists', seedId, 'lastPlayedDate'],
      null,
      Object,
    );
  }
  return state;
}

export function updateThumbs(
  state: State,
  {
    trackId,
    sentiment,
    stationType,
    seedId,
  }: {
    seedId: string;
    sentiment: Sentiment;
    stationType: StationTypeValue;
    trackId: string | number;
  },
) {
  if (isPlaylist(stationType)) {
    return setWith(
      merge({}, state),
      ['playlists', String(seedId), 'thumbs', String(trackId)],
      sentiment,
      Object,
    );
  }

  return state;
}

export function shuffleCurrentPlaylist(
  state: State,
  {
    seedId,
  }: {
    seedId: string;
  },
) {
  const playlist = get(state, ['playlists', seedId], {}) as Playlist;
  const { isShuffled, tracks, shuffledTracks } = playlist;

  return setWith(
    merge({}, state),
    ['playlists', String(seedId)],
    {
      ...playlist,
      isShuffled: !isShuffled,
      shuffledTracks: isShuffled ? shuffledTracks : shuffle(tracks),
    },
    Object,
  );
}

export function deleteTracks(
  state: State,
  {
    ids,
    seedId,
  }: {
    ids: Array<number>;
    seedId: string;
  },
) {
  const playlist = get(state, ['playlists', seedId], {}) as Playlist;
  const { tracks, shuffledTracks } = playlist;
  const newTracks = tracks.map(track => ({
    ...track,
    removed: ids.indexOf(track.id) > -1 ? true : track.removed,
  }));
  const newShuffledTracks =
    shuffledTracks ?
      shuffledTracks.map(track => ({
        ...track,
        removed: ids.indexOf(track.id) > -1 ? true : track.removed,
      }))
    : null;

  return setWith(
    merge({}, state),
    ['playlists', String(seedId)],
    {
      ...playlist,
      shuffledTracks: newShuffledTracks,
      tracks: newTracks,
    },
    Object,
  );
}

export function updateTrackOrder(
  state: State,
  {
    seedId,
    tracks,
  }: {
    seedId: string;
    tracks: [Track];
  },
) {
  const playlist = get(state, ['playlists', seedId], {});

  return setWith(
    merge({}, state),
    ['playlists', String(seedId)],
    {
      ...playlist,
      tracks,
    },
    Object,
  );
}

export function toggleFollowed(
  state: State,
  {
    playlistUserId,
    playlistId,
  }: {
    playlistId: string;
    playlistUserId: number;
  },
) {
  const seedId = encodePlaylistSeedId(playlistUserId, playlistId);
  const playlist = get(state, ['playlists', seedId]);
  const followed = get(playlist, 'followed');

  return setWith(
    merge({}, state),
    ['playlists', String(seedId)],
    {
      ...playlist,
      seedId: playlist.seedId ?? String(seedId),
      followed: !followed,
    },
    Object,
  );
}

export function setPlaylistRequestState(
  state: State,
  {
    ownerId,
    playlistId,
    requestState,
  }: {
    ownerId: number;
    playlistId: string;
    requestState: RequestState;
  },
) {
  const seedId = encodePlaylistSeedId(ownerId, playlistId);
  const playlist = get(state, ['playlists', seedId], {
    ownerId,
    playlistId,
    seedId,
  });

  return setWith(
    merge({}, state),
    ['playlists', String(seedId)],
    {
      ...playlist,
      requestState,
    },
    Object,
  );
}
