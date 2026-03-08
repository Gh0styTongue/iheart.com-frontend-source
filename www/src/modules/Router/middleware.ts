import { Action } from 'state/types';
import { Dispatch, Store } from 'redux';
import { get } from 'lodash-es';
import { NAVIGATE } from 'state/Routing/constants';
import { updateUrl } from 'state/Routing/shims';

export default function reduxRouterMiddleware(_store: Store<any, Action<any>>) {
  return <Payload>(next: Dispatch<Action<Payload>>) =>
    (action: Action<Payload>) => {
      // Middlewear for updating the URL with out navigating, or hitting route statics file.
      const pathname = get(action, ['payload', 'location', 'pathname']);

      if (action.type === NAVIGATE && pathname) {
        updateUrl(pathname);
      }

      return next(action);
    };
}
