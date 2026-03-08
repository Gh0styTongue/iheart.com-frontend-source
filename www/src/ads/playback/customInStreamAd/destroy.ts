import { initialState } from './constants';
import type { CustomInStreamAdMethods } from './types';

const destroy: CustomInStreamAdMethods['destroy'] =
  ({ getState, setState }) =>
  async () => {
    if (!getState().isInitialized) return;

    // TODO - any other cleanup needed? Probably not...
    setState(initialState);
  };

export default destroy;
