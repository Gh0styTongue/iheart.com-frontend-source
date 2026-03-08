import { heroTypes } from './constants';
import { merge } from 'lodash-es';
import { RELiveProfilePayload } from 'state/Live/actions';
import { SetHomeHeroPayload } from './actions';
import { State } from './types';

export const initialState = {
  assetUrl: null,
  backgroundColor: null,
  btnTitle: null,
  hasHero: false,
  hideHero: false,
  imgUrl: null,
  isFavorite: false,
  name: null,
  noLogo: false,
  noMask: false,
  noStretch: false,
  primaryBackgroundSrc: null,
  target: null,
  type: heroTypes.GENERIC,
  url: null,
};

export function setHomeHero(
  state: State,
  { name, btnTitle, url, assetUrl, target }: SetHomeHeroPayload,
): State {
  return {
    ...state,
    assetUrl,
    btnTitle,
    name,
    target,
    url,
  };
}

export function setPremiumBackground(
  state: State,
  { primaryBackgroundSrc, backgroundColor, noLogo }: State,
): State {
  return merge({}, state, {
    backgroundColor: backgroundColor || null,
    hasHero: true,
    noLogo,
    noMask: true,
    noStretch: true,
    primaryBackgroundSrc: primaryBackgroundSrc || null,
    type: heroTypes.PREMIUM,
  });
}

export function setREProfileData(
  state: State,
  { content }: RELiveProfilePayload,
): State {
  const { hero = {} } = content;
  return hero.image ?
      merge({}, state, {
        backgroundColor: hero.background,
        noLogo: false,
        noMask: true,
        noStretch: true,
        primaryBackgroundSrc: hero.image,
        type: heroTypes.PREMIUM,
      })
    : merge({}, state, initialState);
}

export function setBackground(
  state: State,
  { primaryBackgroundSrc, imgUrl, noLogo, noMask }: State,
): State {
  return merge({}, state, {
    imgUrl,
    noLogo,
    noMask,
    noStretch: false,
    primaryBackgroundSrc,
    type: heroTypes.GENERIC,
  });
}

export function setHasHero(state: State, { hasHero }: State): State {
  return merge({}, state, { hasHero });
}

export function setHideHero(state: State, { hideHero }: State): State {
  return merge({}, state, { hideHero });
}

export function reset(): State {
  return merge({}, initialState, { hasHero: false });
}

export function setTitle(state: State, { name }: State): State {
  return merge({}, state, { name });
}
