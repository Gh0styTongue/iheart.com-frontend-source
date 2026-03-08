import hub from 'shared/utils/Hub';
import { Action } from 'state/types';
import { Dispatch } from 'redux';

function triggerAll(meta: Array<{ event: string; args: Array<any> }>) {
  return meta.forEach(({ event, args = [] }) => hub.trigger(event, ...args));
}

function hubMiddleware() {
  return <Payload>(next: Dispatch<Action<Payload>>) =>
    (action: Action<Payload>) => {
      const { meta = {} } = action;
      if (meta.hub) {
        if (meta.deferHub) {
          next(action);

          return triggerAll(meta.hub);
        }

        triggerAll(meta.hub);
      }
      return next(action);
    };
}

export default hubMiddleware;
