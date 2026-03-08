import { getPromos } from 'state/Promo/actions';
import { PAGE_TYPE } from 'constants/pageType';
import { setHasHero } from 'state/Hero/actions';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch) {
    await dispatch(setHasHero(true));
    await dispatch(getPromos());
  };
}

export function pageInfo() {
  return {
    channel: 'Upsell',
    contentType: 'promo subscription offers',
    flow: 'ihr:promo',
    pageName: 'ihr:promo',
    pageType: PAGE_TYPE.PROMO,
    program: 'ihr:promo',
  };
}
