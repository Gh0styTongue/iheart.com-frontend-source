import getCustomPrerollUrl from 'ads/playback/customPrerolls/lib/getCustomPrerollUrl';
import type { CustomPrerollMethods } from './types';

const load: CustomPrerollMethods['load'] =
  ({ getState }) =>
  async params => {
    const { isEnabled } = getState();

    if (!isEnabled) return null;

    return getCustomPrerollUrl(params);
  };

export default load;
