import createReducer from 'state/createReducer';
import { combineReducers } from 'redux';
import { RECEIVE_THUMBS, RECEIVE_TRACKS } from './constants';
import { receiveThumbs, receiveTracks, updateThumbs } from './reducers';
import { UPDATE_THUMBS } from 'state/Stations/constants';

export const initialState = {};

const tracksReducer = createReducer(initialState, {
  [RECEIVE_TRACKS]: receiveTracks,
});

const thumbsReducer = createReducer(initialState, {
  [RECEIVE_THUMBS]: receiveThumbs,
  [UPDATE_THUMBS]: updateThumbs,
});

const reducer = combineReducers({
  thumbs: thumbsReducer,
  tracks: tracksReducer,
});

export default reducer;
