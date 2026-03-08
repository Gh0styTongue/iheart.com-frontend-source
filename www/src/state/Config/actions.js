import { getAmpUrl } from 'state/Config/selectors';
import { getEnv } from 'state/Environment/selectors';
import { getUserLocationConfig } from './services';
import { RECEIVE_LOCATION_CONFIG } from 'state/Config/constants';

export const receiveLocationConfig = config => ({
  payload: config,
  type: RECEIVE_LOCATION_CONFIG,
});

export const requestUserLocationConfig =
  userName =>
  (dispatch, getState, { transport }) => {
    const state = getState();
    const request = getUserLocationConfig(
      getAmpUrl(state),
      getEnv(state),
      userName,
    )();
    return transport(request).then(({ data }) =>
      dispatch(receiveLocationConfig(data.config)),
    );
  };
