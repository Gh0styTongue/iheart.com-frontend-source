import { createSelector } from 'reselect';
import { facebookDefaultCountryMap } from './constants';
import { getCountryCode } from 'state/Config/selectors';
import { State as RootState } from 'state/types';
import { State } from './types';
import { validateLanguage } from 'utils/i18n';

export const geti18nState = createSelector<RootState, RootState, State>(
  state => state,
  state => state?.i18nState ?? {},
);

export const getLang = createSelector(geti18nState, state => {
  return validateLanguage(state.lang);
});

export const getFacebookLang = createSelector(getLang, lang => {
  const parts = lang.split('-') as Array<
    keyof typeof facebookDefaultCountryMap
  >;

  if (parts.length === 1)
    return facebookDefaultCountryMap[parts[0]] || `${parts[0]}_US`;

  return `${parts[0].toLowerCase()}_${parts[1].toUpperCase()}`;
});

export const getTranslations = createSelector(
  geti18nState,
  state => state.translations ?? {},
);

export const getLangPrefix = createSelector(
  getLang,
  lang => lang.split('-')[0],
);

// WEB-9373 WEB-9488 ZS 10/19/17 This logic is used because we accept languages without countries
// specifically spanish, but in order to return the correct information, RadioEdit/Google requires
// a fully qualified locale with country AND language separated by a hyphen
export const getLocale = createSelector(
  getCountryCode,
  getLang,
  (country, lang) => {
    return lang.indexOf('-') >= 0 ? lang : `${lang}-${country}`;
  },
);
