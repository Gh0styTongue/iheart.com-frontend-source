import localStorage from 'utils/localStorage';
import { LIVE_PREROLL_KEY } from './constants';
import type { LivePrerollMethods } from './types';

const complete: LivePrerollMethods['complete'] = () => async () => {
  // Set the last preroll time on complete to prevent user's from
  // "escaping" a preroll by refreshing
  localStorage.setItem(LIVE_PREROLL_KEY, Date.now());
};

export default complete;
