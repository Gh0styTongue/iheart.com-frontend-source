import createReducer from 'state/createReducer';
import { addAdditionalAlbums, addAlbum, addAlbums } from './reducers';
import {
  RECEIVE_ADDITIONAL_ALBUMS,
  RECEIVE_ALBUM,
  RECEIVE_ALBUMS,
} from './constants';
import { State } from './types';

export const initialAlbumsState = { albums: {} };

const reducer = createReducer<State>(initialAlbumsState, {
  [RECEIVE_ADDITIONAL_ALBUMS]: addAdditionalAlbums,
  [RECEIVE_ALBUM]: addAlbum,
  [RECEIVE_ALBUMS]: addAlbums,
});

export default reducer;
