import logger, { CONTEXTS } from 'modules/Logger';
import { Action } from 'state/types';
import { Dispatch, Store } from 'redux';

export function reduxLogger(store: Store<any, Action<any>>) {
  return <Payload>(next: Dispatch<Action<Payload>>) =>
    (action: Action<Payload>) => {
      const currentState = store.getState();
      const result = next(action);
      const nextState = store.getState();
      logger.info([CONTEXTS.REDUX, action.type], {
        action,
        currentState,
        nextState,
      });
      return result;
    };
}
