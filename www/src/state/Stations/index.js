import createReducer from 'state/createReducer';
import { LOGOUT } from 'state/Session/constants';
import { logout, receiveListenHistory, requestListenHistory } from './reducers';
import { RECEIVE_LISTEN_HISTORY, REQUEST_LISTEN_HISTORY } from './constants';

export const initialState = {
  listenHistoryReceived: false,
  requestingListenHistory: false,
  totalListenHistoryStations: 0,
};

const reducer = createReducer(initialState, {
  [LOGOUT]: logout,
  [RECEIVE_LISTEN_HISTORY]: receiveListenHistory,
  [REQUEST_LISTEN_HISTORY]: requestListenHistory,
});

export default reducer;
