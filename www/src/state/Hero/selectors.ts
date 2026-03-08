import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState, Selector } from 'state/types';
import { State } from './types';

export const getHero = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'hero', {}) as State,
);

export function makeHeroSelector<T>(attr: string, fallback?: T): Selector<T> {
  return createSelector<RootState, State, T>(getHero, hero =>
    get(hero, attr, fallback),
  );
}

export const primaryBackgroundSrc = makeHeroSelector<string>(
  'primaryBackgroundSrc',
);

export const backgroundColor = makeHeroSelector<string>('backgroundColor');

export const type = makeHeroSelector<string>('type');

export const hasHero = makeHeroSelector<boolean>('hasHero');

export const noStretch = makeHeroSelector<boolean>('noStretch');

export const noMask = makeHeroSelector<boolean>('noMask');

export const noLogo = makeHeroSelector<boolean>('noLogo');

export const imgUrl = makeHeroSelector<string>('imgUrl');

export const hideHero = makeHeroSelector<boolean>('hideHero');

export const name = makeHeroSelector<string>('name');

export const btnTitle = makeHeroSelector<string>('btnTitle');

export const url = makeHeroSelector<string>('url');

export const assetUrl = makeHeroSelector<string>('assetUrl');
