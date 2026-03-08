import logger, { CONTEXTS } from 'modules/Logger';
import { Action } from 'state/types';
import { Dispatch } from 'redux';
import { get } from 'lodash-es';

export default function localStorageMiddleware() {
  return <Payload>(next: Dispatch<Action<Payload>>) =>
    (action: Action<Payload>) => {
      const {
        remove,
        set,
      }: {
        set?: { [key: string]: { value: string } };
        remove?: Array<{ key: string }>;
      } = get(action, ['meta', 'localStorage'], {});
      try {
        if (remove) {
          remove.forEach(({ key }) => {
            if (localStorage.getItem(key)) localStorage.removeItem(key);
          });
        }

        if (set) {
          Object.keys(set).forEach(key => {
            const { value } = set[key];
            if (localStorage.getItem(key)) localStorage.removeItem(key);
            localStorage.setItem(key, value);
          });
        }
      } catch (e: any) {
        const errObj = e instanceof Error ? e : new Error(e);
        logger.error([CONTEXTS.REDUX, CONTEXTS.LOCAL_STORAGE], e, {}, errObj);
      }

      return next(action);
    };
}
