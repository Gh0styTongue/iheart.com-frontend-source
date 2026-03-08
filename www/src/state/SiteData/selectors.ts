import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { RecurlySkus, State } from './types';
import { State as RootState } from 'state/types';

export const getSiteData = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'siteData', {}) as State,
);

export const supportsSocialConnect = createSelector<RootState, State, boolean>(
  getSiteData,
  sitedata => get(sitedata, ['socialOpts', 'supportsConnect']),
);

export const recurlySkus = createSelector<RootState, State, RecurlySkus>(
  getSiteData,
  sitedata => get(sitedata, ['recurly', 'skus']),
);
