import {
  getPodcastCategories,
  getPodcastsByCategory,
} from 'state/Podcast/actions';
import {
  getPodcastCategoryId,
  getPodcastCategoryName,
} from 'state/Podcast/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import { State } from 'state/buildInitialState';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState) {
    const state = getState();
    const categoryId = `${getSlugId(state)}`;
    const action = getPodcastsByCategory(categoryId);
    await Promise.all([dispatch(getPodcastCategories()), dispatch(action)]);
  };
}

export function pageInfo(state: State) {
  const pageId = getPodcastCategoryId(state);
  const title = getPodcastCategoryName(state);

  return {
    pageId,
    pageType: PAGE_TYPE.SHOW_CATEGORY,
    title,
    targeting: {
      name: 'directory:show',
      modelId: `sc${pageId}`,
    },
  };
}
