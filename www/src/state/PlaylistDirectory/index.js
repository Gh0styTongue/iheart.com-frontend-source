import createReducer from 'state/createReducer';
import { combineReducers } from 'redux';
import { RECEIVE_PLAYLIST_DIRECTORY } from './constants';
import { receiveCategories, receivePlaylistTiles } from './reducers';

const categories = createReducer(
  {},
  {
    [RECEIVE_PLAYLIST_DIRECTORY]: receiveCategories,
  },
);

const playlistTiles = createReducer(
  {},
  {
    [RECEIVE_PLAYLIST_DIRECTORY]: receivePlaylistTiles,
  },
);

const reducer = combineReducers({
  categories,
  playlistTiles,
});

export default reducer;
