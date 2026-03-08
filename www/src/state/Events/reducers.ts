import { Events, State } from './types';
import { merge } from 'lodash-es';

export function eventsLoaded(
  state: State,
  payload: {
    events: Events;
  },
): State {
  return merge({}, state, { receivedEvents: payload });
}
