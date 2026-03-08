import {
  FETCH_RECURLY_SKUS,
  RESET_SOCIAL_OPTS,
  SET_SOCIAL_OPTS,
} from './constants';
import { getAmpUrl } from 'state/Config/selectors';
import { makeRecurlySkuRequest } from './services';

export function setSocialOpts(props) {
  return {
    payload: props,
    type: SET_SOCIAL_OPTS,
  };
}

export function resetSocialOpts() {
  return { type: RESET_SOCIAL_OPTS };
}

export function getRecurlySkus() {
  return (dispatch, getState, { transport }) => {
    transport(makeRecurlySkuRequest({ ampUrl: getAmpUrl(getState()) })).then(
      ({ data }) =>
        dispatch({
          payload: data,
          type: FETCH_RECURLY_SKUS,
        }),
    );
  };
}
