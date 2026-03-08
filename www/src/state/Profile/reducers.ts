import localStorage from 'utils/localStorage';
import LocalStorageKeys from 'constants/localStorageKeys';
import { pick } from 'lodash-es';
import type { Invoice, PIIBlockingType, State } from './types';

export const defaultKeys: Array<string> = [
  'accountType',
  'birthDate',
  'birthYear',
  'email',
  'emailOptOut',
  'error',
  'facebookId',
  'favorites',
  'firstError',
  'gender',
  'googlePlusId',
  'iheartId',
  'marketName',
  'name',
  'preferences',
  'profileReceived',
  'roaming',
  'shareProfile',
  'zipCode',
  'phoneNumber',
];

const getIsUnderAge = (): boolean =>
  localStorage.getItem<boolean>(LocalStorageKeys.UnderAge, false);

const setIsUnderage = (): void =>
  localStorage.setItem(LocalStorageKeys.UnderAge, true);

export function requestProfile(state: State): State {
  return state;
}

export function receiveProfile(state: State, payload: State): State {
  return {
    ...state,
    ...pick(payload, defaultKeys),
    profileReceived: true,
  };
}

export function rejectProfile(state: State, payload: any): State {
  return {
    ...state,
    error: payload,
  };
}

export function savePreference(
  state: State,
  payload: {
    key: string;
    value: string;
  },
): State {
  return {
    ...state,
    preferences: {
      ...state.preferences,
      [payload.key]: payload.value,
    },
  };
}

export function saveProperty(
  state: State,
  payload: {
    key: string;
    value: string;
  },
): State {
  return {
    ...state,
    [payload.key]: payload.value,
  };
}

export function saveIsUnderage(
  state: State,
  {
    isUnderAge,
  }: {
    isUnderAge: boolean;
  },
): State {
  const storedIsUnderAge = getIsUnderAge();
  const resolvedIsUnderAge = storedIsUnderAge || isUnderAge;

  if (resolvedIsUnderAge) {
    setIsUnderage();
  }
  return {
    ...state,
    isUnderAge: resolvedIsUnderAge,
  };
}

export function requestRecurlyBillingHistory(
  state: State,
  { invoices }: { invoices: [Invoice] },
) {
  return {
    ...state,
    invoices,
  };
}

export function togglePIIBlocking(
  state: State,
  piiBlockingTypes: Array<PIIBlockingType>,
) {
  return {
    ...state,
    piiBlockingTypes,
  };
}

export function linkIOSToAlexa(
  state: State,
  { success }: { success: boolean },
) {
  return {
    ...state,
    alexaIOSLinkSuccessful: success,
  };
}
