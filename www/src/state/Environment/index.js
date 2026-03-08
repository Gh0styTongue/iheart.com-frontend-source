import createReducer from 'state/createReducer';
import { SET_ENVIRONMENT_VARS } from './constants';
import { setEnvironmentVars } from './reducers';

export const initialState = { isSDK: false };

const reducer = createReducer(initialState, {
  [SET_ENVIRONMENT_VARS]: setEnvironmentVars,
});

export default reducer;
