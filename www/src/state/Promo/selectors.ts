import { createSelector } from 'reselect';
import type { State } from 'state/types';

export const getPromos = (state: State) => state?.promo ?? {};

export const getCards = createSelector(
  getPromos,
  promos => promos?.cards ?? [],
);
