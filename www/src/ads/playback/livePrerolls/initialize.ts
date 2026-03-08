import getPrerollsEnabled from 'ads/playback/lib/getPrerollsEnabled';
import type { LivePrerollMethods } from './types';

const initialize: LivePrerollMethods['initialize'] =
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
