import createReducer from 'state/createReducer';
import { initialState, receiveRecs, setCanLoadMore } from './reducers';
import { RECEIVE_RECS, SET_CAN_LOAD_MORE } from './constants';
import { State } from './types';

const reducer = createReducer<State>(initialState, {
  [RECEIVE_RECS]: receiveRecs,
  [SET_CAN_LOAD_MORE]: setCanLoadMore,
});

export default reducer;
