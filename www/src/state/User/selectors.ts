import { createSelector } from 'reselect';
import type { AbTestGroups, User as State } from './types';
import type { State as Profile } from 'state/Profile/types';
import type { State as RootState } from 'state/types';
import type { SubInfo } from 'state/Entitlements/types';

const getUser = createSelector<RootState, RootState, State>(
  state => state,
  state => (state?.user as State) ?? ({} as State),
);

export const getAbTests = createSelector<RootState, State, AbTestGroups>(
  getUser,
  user => user?.abTestGroups,
);

export const getUserType = createSelector<
  RootState,
  State,
  SubInfo['subscriptionType']
>(getUser, user => user?.subscription.subInfo.subscriptionType);

export const getUserProfile = createSelector<RootState, State, Profile>(
  getUser,
  user => user?.profile,
);

export const getUserInvoices = createSelector<RootState, Profile, any>(
  getUserProfile,
  profile => profile?.invoices ?? [],
);

export default getUser;
