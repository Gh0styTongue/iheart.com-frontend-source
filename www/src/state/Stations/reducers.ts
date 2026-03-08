import { get, merge } from 'lodash-es';
import { Payload, State } from './types';

export const initialState = {
  listenHistoryReceived: false,
  requestingListenHistory: false,
  totalListenHistoryStations: 0,
};

export function requestListenHistory(state: State) {
  return merge({}, state, { requestingListenHistory: true });
}

export function receiveListenHistory(state: State, payload: Payload) {
  return merge({}, state, {
    listenHistoryReceived: true,
    requestingListenHistory: false,
    totalListenHistoryStations: get(payload, 'totalListenHistoryStations'),
  });
}

export function logout(state: State) {
  return merge({}, state, {
    listenHistoryReceived: false,
    requestingListenHistory: false,
    totalListenHistoryStations: 0,
  });
}
