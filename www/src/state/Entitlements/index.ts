import createReducer from 'state/createReducer';
import { AD_FREE, ENTITLEMENTS_LOADED } from 'state/Entitlements/constants';
import { LOGOUT } from 'state/Session/constants';
import { logout, subInfoLoaded } from './reducers';
import { State } from './types';

export const initialState: State = {
  entitlements: {
    [AD_FREE]: false,
  },
  subInfo: {
    expiration: null,
    hasBillingHistory: false,
    isAutoRenewing: null,
    isTrial: false,
    isTrialEligible: false,
    subInfoLoaded: false,
    subscriptionType: 'NONE',
    trialMonths: undefined,
  },
};

export default createReducer<State>(initialState, {
  [ENTITLEMENTS_LOADED]: subInfoLoaded,
  [LOGOUT]: logout,
});
