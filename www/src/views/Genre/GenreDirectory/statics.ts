import { PAGE_TYPE } from 'constants/pageType';
import { requestGenresRecs } from 'state/Recs/actions';
import { setHasHero } from 'state/Hero/actions';
import type { Thunk } from 'state/types';

export function getAsyncData(): Thunk<void> {
  return async function thunk(dispatch) {
    dispatch(setHasHero(false));
    await dispatch(requestGenresRecs());
  };
}

export function pageInfo() {
  return {
    pageType: PAGE_TYPE.GENRE,
    targeting: {
      name: 'directory:genre',
      modelId: 'directory:genre:home',
    },
  };
}
