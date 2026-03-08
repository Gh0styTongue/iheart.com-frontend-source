import loadNewsArticles from 'state/News/actions/loadNewsArticles';
import { getSlug } from 'state/Routing/selectors';
import { NEWS_DIRECTORY_SLUG } from 'state/News/constants';
import { setHasHero } from 'state/Hero/actions';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return function thunk(dispatch, getState) {
    dispatch(setHasHero(false));
    const topicSlug = getSlug(getState());
    return dispatch(loadNewsArticles(NEWS_DIRECTORY_SLUG, topicSlug));
  };
}
