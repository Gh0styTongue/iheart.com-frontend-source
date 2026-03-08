import { PAGE_TYPE } from 'constants/pageType';
import { setHasHero } from 'state/Hero/actions';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch) {
    dispatch(setHasHero(false));
  };
}

export function pageInfo() {
  return {
    pageType: PAGE_TYPE.YOUR_LIBRARY,
    targeting: {
      name: 'yourlibrary',
    },
  };
}
