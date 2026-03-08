import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as SocialState } from './types';
import { State } from 'state/types';

export const getSocial = createSelector<State, State, SocialState>(
  state => state,
  state => get(state, 'social', {}) as SocialState,
);

export function makeSocialSelector<T>(
  provider: string,
  attr: string,
  fallback?: T,
) {
  return createSelector<State, any, T>(getSocial, social =>
    get(social, [provider, attr], fallback),
  );
}

export const getFacebookAppId = makeSocialSelector<string>('facebook', 'appId');

export const getFacebookPages = makeSocialSelector<string>('facebook', 'pages');

export const getFacebookName = makeSocialSelector<string>('facebook', 'name');

export const getInstagramName = makeSocialSelector<string | undefined>(
  'instagram',
  'name',
);

export const getTwitterName = makeSocialSelector<string | undefined>(
  'twitter',
  'name',
);

export const getGooglePlusAppKey = makeSocialSelector<string | undefined>(
  'googlePlus',
  'appKey',
);

export const getGooglePlusClientSecret = makeSocialSelector<string | undefined>(
  'googlePlus',
  'clientSecret',
);

export const getYoutubeName = makeSocialSelector<string | undefined>(
  'youtube',
  'name',
);

export const getTumblrName = makeSocialSelector<string | undefined>(
  'tumblr',
  'name',
);
