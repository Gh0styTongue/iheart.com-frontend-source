import { initialState } from './constants';
import type { LivePrerollMethods } from './types';

const destroy: LivePrerollMethods['destroy'] =
  ({ getState, setState }) =>
  async () => {
    if (!getState().isInitialized) return;

    setState(initialState);
  };

export default destroy;
