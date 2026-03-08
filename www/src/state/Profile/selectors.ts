import getUser from 'state/User/selectors';
import getYear from 'date-fns/get_year';
import mapPIIBlockingTypes from 'utils/mapPIIBlockingTypes';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getBestUsername, getYearDiff, truncateIfNecessary } from './helpers';
import { getResourceId, PlaylistInfo } from 'state/Routing/selectors';
import { joinPathComponents } from 'utils/canonicalHelpers';
import { State as RootState, Selector } from 'state/types';
import { State } from './types';
import { User } from 'state/buildInitialState';
import type { AccountType } from 'state/Profile/types';

export const getProfile: Selector<State> = createSelector<
  RootState,
  User,
  State
>(getUser, user => get(user, 'profile', {}) as State);

export function makeProfileSelector<T>(
  property: string,
  defaultVal?: T,
): Selector<T> {
  return createSelector<RootState, State, T>(getProfile, profile =>
    get(profile, property, defaultVal),
  );
}

export const getProfileReceived: Selector<boolean> =
  makeProfileSelector('profileReceived');

export const getAccountType: Selector<AccountType> =
  makeProfileSelector('accountType');

export const getBirthDate: Selector<string | null | undefined> =
  makeProfileSelector('birthDate');

export const getEmail: Selector<string | null | undefined> =
  makeProfileSelector('email');

export const getEmailOptOut: Selector<boolean | null | undefined> =
  makeProfileSelector('emailOptOut');

export const getError: Selector<any | null | undefined> =
  makeProfileSelector('error');

export const getFacebookId: Selector<string | null | undefined> =
  makeProfileSelector('facebookId');

export const getFavorites: Selector<any | null | undefined> =
  makeProfileSelector('favorites');

export const getFirstError: Selector<any | null | undefined> =
  makeProfileSelector('firstError');

export const getGender: Selector<string | null | undefined> =
  makeProfileSelector('gender');

export const getGooglePlusId: Selector<string | null | undefined> =
  makeProfileSelector('googlePlusId');

export const getIheartId: Selector<string | null | undefined> =
  makeProfileSelector('iheartId');

export const getIsUnderAge: Selector<boolean> = makeProfileSelector(
  'isUnderAge',
  false,
);

export const getMarketName: Selector<string | null | undefined> =
  makeProfileSelector('marketName');

export const getName: Selector<string | undefined> =
  makeProfileSelector('name');

export const getPhoneNumber: Selector<string | undefined> =
  makeProfileSelector('phoneNumber');

export const getPreferences =
  makeProfileSelector<Record<string, any>>('preferences');

export const getRoaming: Selector<boolean | null | undefined> =
  makeProfileSelector('roaming');

export const getShareProfile: Selector<string | null | undefined> =
  makeProfileSelector('shareProfile');

export const getZipCode: Selector<string | null | undefined> =
  makeProfileSelector('zipCode');

export const getBirthYear = createSelector(
  [getBirthDate, makeProfileSelector('birthYear')],
  (date, year) => {
    if (year) {
      return year;
    }
    if (date) {
      return new Date(date).getFullYear();
    }
    return null;
  },
);

export const getUsername: Selector<string | null | undefined> = createSelector(
  [getName, getEmail],
  getBestUsername,
);

export function getTruncatedUsernameSelector(
  maxLength: number,
): Selector<string> {
  return createSelector(getUsername, username =>
    truncateIfNecessary(maxLength, username),
  );
}

export const getAge: Selector<number | null | undefined> = createSelector(
  [getBirthDate, getBirthYear],
  (birthDate, birthYear) => {
    if (birthDate) {
      return getYearDiff(birthDate);
    }
    if (birthYear) {
      return getYear(new Date()) - Number(birthYear);
    }
    return null;
  },
);

export function makeProfilePath(userId: PlaylistInfo | string | null) {
  if (!userId) return '/my/';
  return joinPathComponents('/profile/', String(userId));
}

export const getProfilePath = createSelector(getResourceId, makeProfilePath);

export const getBlockedPIIBehaviors: Selector<{
  sanitizeAds: boolean;
  sanitizeStreams: boolean;
  turnOffAndo: boolean;
  turnOffOutbrain: boolean;
}> = createSelector(getProfile, ({ piiBlockingTypes }) =>
  mapPIIBlockingTypes(piiBlockingTypes),
);

export const alexaLinkWasSuccessful = makeProfileSelector<boolean | undefined>(
  'alexaIOSLinkSuccessful',
);

export const getPiiBlockingTypes = makeProfileSelector<Array<string>>(
  'piiBlockingTypes',
  [],
);
