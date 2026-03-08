import cookie, { CookieAttributes } from 'js-cookie';
import logger, { CONTEXTS } from 'modules/Logger';
import { Action } from 'state/types';
import { Dispatch } from 'redux';
import { get } from 'lodash-es';

export default function cookieMiddleware() {
  return <Payload>(next: Dispatch<Action<Payload>>) =>
    (action: Action<Payload>) => {
      const {
        remove,
        set,
      }: {
        set?: { [key: string]: { value: string; config?: CookieAttributes } };
        remove?: Array<{ key: string; config?: CookieAttributes }>;
      } = get(action, ['meta', 'cookies'], {});
      try {
        if (remove) {
          remove.forEach(({ key, config }) => {
            if (cookie.get(key)) cookie.remove(key, config);
          });
        }

        if (set) {
          Object.keys(set).forEach(key => {
            const { value, config } = set[key];
            if (cookie.get(key)) cookie.remove(key);
            cookie.set(key, value, config);
          });
        }
      } catch (e: any) {
        const errObj = e instanceof Error ? e : new Error(e);
        logger.error([CONTEXTS.REDUX, CONTEXTS.COOKIES], e, {}, errObj);
      }

      return next(action);
    };
}
