import type { State } from './types';

export const LIVE_PREROLL_KEY = 'ads-lastLivePrerollTime';

export const initialState: State = {
  isEnabled: true,
  isInitialized: false,
};

// GPT master video parameters
// [Doc](https://support.google.com/dfp_premium/answer/1068325?hl=en)
export const DEFAULT_LIVE_PARAMS = {
  // Request comes from video player (vp)
  env: 'vp',
  // We're using Google DFP, not Google Ad Manager (GAM)
  gdfp_req: 1,
  // Request mode
  impl: 's',
  // Ad Unit
  iu: '/6663/ccr.test',
  output: 'vast',
  // Video size
  sz: '640x480',
  // Turns on delayed impressions
  unviewed_position_start: 1,
  tfcd: 0,
} as const;
