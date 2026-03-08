import {
  getPodcastCategories,
  getPodcastFeaturedCategories,
  getPodcastNetworks,
  getPodcastPopularCategories,
} from 'state/Podcast/actions';
import { PAGE_TYPE } from 'constants/pageType';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch) {
    const promises = [
      dispatch(getPodcastPopularCategories()),
      dispatch(getPodcastFeaturedCategories()),
      dispatch(getPodcastNetworks()),
    ];

    if (!__CLIENT__) {
      // Don't dispatch on Client as the component has a fallback to try again
      promises.push(dispatch(getPodcastCategories()));
    }
    await Promise.all(promises);
  };
}

export function pageInfo() {
  return {
    pageType: PAGE_TYPE.SHOW,
    targeting: {
      name: 'directory:show',
      modelId: 'directory:show:home',
    },
  };
}
