import { getSeedId } from 'state/Favorites/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import type { State } from 'state/types';

export function pageInfo(state: State) {
  const pageId = getSeedId(state);
  return {
    pageId,
    pageType: PAGE_TYPE.FAVORITES,
    targeting: {
      name: 'favorites',
      modelId: `f${pageId}`,
    },
  };
}
