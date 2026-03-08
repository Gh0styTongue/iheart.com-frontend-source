import reduxFactory from 'state/factory';
import { toggleFavoriteStation as liveToggleFavorite } from 'state/Live/actions';

const store = reduxFactory();

const DEFERRABLE_ACTIONS = {
  LIVE_TOGGLE_FAVORITE: liveToggleFavorite,
};

export default () => {
  const serialized = sessionStorage.getItem('deferredAction');
  sessionStorage.removeItem('deferredAction');
  if (!serialized) return Promise.resolve();
  const parsed = JSON.parse(serialized);
  const action = DEFERRABLE_ACTIONS[parsed.action];
  return store.dispatch(action(...parsed.args));
};
