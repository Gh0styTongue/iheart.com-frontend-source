import { Playlist } from 'state/Playlist/types';
import { State } from './types';
import { union } from 'lodash-es';

export function getMyMusicCollections(
  state: State,
  payload: Array<Playlist>,
): State {
  return {
    ...state,
    collections: {
      ids: union(
        state.collections.ids,
        payload.map(
          collection => `${String(collection.userId)}/${collection.id}`,
        ),
      ),
    },
  };
}

export function removeMyMusicCollection(
  state: State,
  payload: {
    id: number;
    userId: number;
  },
): State {
  return {
    ...state,
    collections: {
      ...state.collections,
      ids: state.collections.ids.filter(
        id => id !== `${payload.userId}/${payload.id}`,
      ),
    },
  };
}

export function followMyMusicCollectionId(
  state: State,
  payload: string,
): State {
  return {
    ...state,
    collections: {
      ids: state.collections.ids.concat([payload]),
    },
  };
}

export function unfollowMyMusicCollectionId(
  state: State,
  payload: string,
): State {
  return {
    ...state,
    collections: {
      ids: state.collections.ids.filter(id => id !== payload),
    },
  };
}
