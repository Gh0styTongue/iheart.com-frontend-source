export type AudioAdProvider = 'ad-providers/adswizz' | 'ad-providers/triton';
export const AUDIO_AD_PROVIDER: Record<string, AudioAdProvider> = {
  ADSWIZZ: 'ad-providers/adswizz',
  TRITON: 'ad-providers/triton',
};

export const SLOT_DIMENSIONS: Record<string, Array<[number, number]>> = {
  RIGHT_RAIL: [
    [300, 250],
    [300, 600],
    [300, 1050],
  ],
  HEADER_MOBILE: [[320, 50]],
  HEADER_DESKTOP: [[728, 90]],
  FULLSCREEN_PLAYER: [[300, 250]],
  SIDEBURNS: [[3, 3]],
  HERO: [[5, 5]],
};
