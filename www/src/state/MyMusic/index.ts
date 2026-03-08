import createReducer from 'state/createReducer';
import {
  CREATE_MY_MUSIC_COLLECTION,
  GET_MY_MUSIC_COLLECTIONS,
  REMOVE_MY_MUSIC_COLLECTION,
} from './constants';
import {
  FOLLOW_MY_MUSIC_PLAYLIST_ID,
  UNFOLLOW_MY_MUSIC_PLAYLIST_ID,
} from 'state/Playlist/constants';
import {
  followMyMusicCollectionId,
  getMyMusicCollections,
  removeMyMusicCollection,
  unfollowMyMusicCollectionId,
} from './reducers';
import { State } from './types';

export const initialState = {
  collections: {
    ids: [],
  },
  tracks: {
    ids: [],
    pagination: {
      next: '',
      nextPageKey: '',
    },
  },
};

const reducer = createReducer<State>(initialState, {
  [CREATE_MY_MUSIC_COLLECTION]: getMyMusicCollections,
  [FOLLOW_MY_MUSIC_PLAYLIST_ID]: followMyMusicCollectionId,
  [GET_MY_MUSIC_COLLECTIONS]: getMyMusicCollections,
  [REMOVE_MY_MUSIC_COLLECTION]: removeMyMusicCollection,
  [UNFOLLOW_MY_MUSIC_PLAYLIST_ID]: unfollowMyMusicCollectionId,
});

export default reducer;
