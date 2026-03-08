import createReducer from 'state/createReducer';
import {
  FETCH_RECURLY_SKUS,
  RESET_SOCIAL_OPTS,
  SET_SOCIAL_OPTS,
} from './constants';
import { resetSocialOpts, setRecurlySkus, setSocialOpts } from './reducers';
import { State } from './types';

export const initialState = {
  socialOpts: {
    supportsConnect: false,
    supportsShare: true,
  },
};

const reducer = createReducer<State>(initialState, {
  [FETCH_RECURLY_SKUS]: setRecurlySkus,
  [RESET_SOCIAL_OPTS]: resetSocialOpts,
  [SET_SOCIAL_OPTS]: setSocialOpts,
});

export default reducer;
