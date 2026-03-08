import createReducer from 'state/createReducer';
import {
  ARTICLE_LOADED,
  LOAD_NEWS_DIRECTORY,
  REQUESTING_ARTICLE,
} from './constants';
import {
  articleLoaded,
  newsDirectoryLoaded,
  requestingArticle,
} from './reducers';
import { State } from './types';

export const initialState = {
  articleLists: {},
  articles: {},
  status: {
    requestingArticle: false,
  },
};

const reducer = createReducer<State>(initialState, {
  [ARTICLE_LOADED]: articleLoaded,
  [LOAD_NEWS_DIRECTORY]: newsDirectoryLoaded,
  [REQUESTING_ARTICLE]: requestingArticle,
});

export default reducer;
