import loadNewsArticles from 'state/News/actions/loadNewsArticles';
import { NEWS_DIRECTORY_SLUG } from 'state/News/constants';
import { setHasHero } from 'state/Hero/actions';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk {
  return function thunk(dispatch) {
    dispatch(setHasHero(false));
    return dispatch(loadNewsArticles(NEWS_DIRECTORY_SLUG));
  };
}
