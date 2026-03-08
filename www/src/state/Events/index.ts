import createReducer from 'state/createReducer';
import { EVENTS_LOADED } from './constants';
import { eventsLoaded } from './reducers';
import { State } from './types';

export const initialState = {};

const events = createReducer<State>(initialState, {
  [EVENTS_LOADED]: eventsLoaded,
});

export default events;
