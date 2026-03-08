import { initialState } from './constants';
import type { CustomPrerollMethods } from './types';

const destroy: CustomPrerollMethods['destroy'] =
  ({ getState, setState }) =>
  async () => {
    if (!getState().isInitialized) return;

    setState(initialState);
  };

export default destroy;
