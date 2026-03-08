import getPrerollsEnabled from 'ads/playback/lib/getPrerollsEnabled';
import type { CustomPrerollMethods } from './types';

const initialize: CustomPrerollMethods['initialize'] =
  ({ getState, setState }) =>
  async () => {
    if (getState().isInitialized) return;

    const isEnabled = await getPrerollsEnabled();

    setState({
      isEnabled,
      isInitialized: true,
    });
  };

export default initialize;
