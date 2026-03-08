import createReducer from 'state/createReducer';
import { ARTICLE_LOADED } from 'state/News/constants';
import {
  articleLoaded,
  receiveGenres,
  receiveSelectedGenres,
} from './reducers';
import {
  RECEIVE_GENRE_SELECTED,
  RECEIVE_GENRES,
  UPDATE_GENRE_PREFERENCES,
} from './constants';
import { State } from './types';

export const initialState = {
  genres: {},
  receivedGenres: false,
};

export const reducer = createReducer<State>(initialState, {
  [ARTICLE_LOADED]: articleLoaded,
  [RECEIVE_GENRE_SELECTED]: receiveSelectedGenres,
  [RECEIVE_GENRES]: receiveGenres,
  [UPDATE_GENRE_PREFERENCES]: receiveSelectedGenres,
});

export default reducer;
