import type { State } from './types';

export enum CustomAdTypes {
  Adswizz = 'Adswizz',
  Triton = 'Triton',
}

export const initialState: State = {
  customAdsType: null,
  isEnabled: false,
  isInitialized: false,
};
