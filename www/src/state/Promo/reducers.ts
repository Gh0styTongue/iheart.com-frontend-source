import { Cards, State } from './types';
import { merge } from 'lodash-es';

export function promosLoaded(
  state: State,
  payload: {
    cards: Cards;
  },
): State {
  return merge({}, state, payload);
}
