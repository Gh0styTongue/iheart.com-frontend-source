import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import { mapSeedStation } from 'web-player/mapper';
import { STATION_TYPE } from 'constants/stationTypes';
import { TILE_RES } from 'components/MediaServerImage';
import type { LiveStation, LiveTrack } from './types';

export function mapStations(
  stations: Array<LiveStation>,
  setResolveFlagForStations?: boolean,
) {
  return stations.map(station =>
    mapSeedStation({
      ...station,
      resolved: setResolveFlagForStations || station.resolved,
      seedId: station.seedId ?? station.id,
      seedType: STATION_TYPE.LIVE,
      siteId: station?.feeds?.site_id,
      stationName: station.name,
      stationSite: station.website,
      imgWidth: TILE_RES,
      playedFrom: PLAYED_FROM.DIR_LIVE_FILTERED,
    }),
  );
}

export function mapNowPlayingTrack({
  trackId,
  title,
  artist,
  endTime,
}: LiveTrack) {
  return {
    artistName: artist,
    endTime,
    id: trackId,
    isPlaceholder: true,
    playbackRights: { onDemand: false },
    title,
  };
}
