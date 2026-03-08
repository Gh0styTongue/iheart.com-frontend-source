import {
  CUSTOM_TYPES,
  ON_DEMAND_TYPES,
  PODCAST_TYPES,
  STATION_TYPE,
} from 'constants/stationTypes';
import { PlaybackAdTypes } from 'ads/playback/constants';
import type { StationTypeValue } from 'constants/stationTypes';

/**
 * Returns the adType we should for a new station. Only applies for prerolls
 */
export default function resolvePrerollAdType(
  seedType?: StationTypeValue,
): PlaybackAdTypes | null {
  if (!seedType) return null;
  if (ON_DEMAND_TYPES.includes(seedType)) return null;

  if (seedType === STATION_TYPE.LIVE) return PlaybackAdTypes.LivePrerolls;
  // Custom & Podcast types share the same preroll ad flow
  if ([...CUSTOM_TYPES, ...PODCAST_TYPES].includes(seedType))
    return PlaybackAdTypes.CustomPrerolls;

  return null;
}
