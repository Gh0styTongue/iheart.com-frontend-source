import analytics from './index';
import { Action } from 'state/types';
import { Dispatch } from 'redux';

function middleware() {
  return <Payload>(next: Dispatch<Action<Payload>>) =>
    async (action: Action<Payload>) => {
      const { meta } = action;
      let stall;
      if (meta && meta.analytics) {
        if (typeof meta.analytics === 'function') {
          stall = meta.analytics();
        } else {
          const { data, event } = meta.analytics;
          if (!event && data) analytics.set(data);
          if (event) stall = analytics.track(event, data);
        }
      }
      if (stall instanceof Promise) await stall;

      return next(action);
    };
}

export default middleware;
