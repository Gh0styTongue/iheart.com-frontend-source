import { PlaybackAdTypes } from 'ads/playback/constants';
import type { AdsPlayerContext } from 'ads/playback/AdsPlayerContext/AdsPlayerContext';
import type { ResolveStationParams } from 'state/Player/resolvers';

const resolvePrerollAdParams = (
  adType: PlaybackAdTypes | null,
  params: Omit<ResolveStationParams, 'partialLoad'>,
): Parameters<AdsPlayerContext['load']>[1] => {
  return params;
};

export default resolvePrerollAdParams;
