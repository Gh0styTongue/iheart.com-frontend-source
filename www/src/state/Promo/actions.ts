import transport from 'api/transport';
import { Action, Thunk } from 'state/types';
import { Cards } from './types';
import { getCards } from 'state/Promo/selectors';
import { getCountryCode, getLeadsUrl } from 'state/Config/selectors';
import { getPromos as getPromosService } from 'state/Promo/services';
import { PROMOS_LOADED } from './constants';

type Promos = {
  cards: Cards;
};

export function promosLoaded(promos: Promos): Action<Promos> {
  return {
    payload: promos,
    type: PROMOS_LOADED,
  };
}

export function getPromos(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState) {
    const state = getState();
    const cards = getCards(state);

    if (cards.length) return;

    const { data: promos } = await transport(
      getPromosService({
        base: getLeadsUrl(state),
        country: getCountryCode(state),
      }),
    );

    dispatch(promosLoaded(promos));
  };
}
