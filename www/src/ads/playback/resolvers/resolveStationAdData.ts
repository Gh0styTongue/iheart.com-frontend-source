import { AdsStationTypes, TargetingStationTypes } from 'ads/playback/constants';
import { STATION_TYPE } from 'constants/stationTypes';

export type ResolvedStationData = {
  /**
   * A numeric seed id usually stored as the station.seedId. It generally matches
   * the id in the station's slug
   */
  stationId: string | number;
  /**
   * The string hash we get for a station stream
   */
  streamId: string;
  /**
   * Represents the station type we pass to the /targeting endpoint
   * This only needs to be defined when the streamType for the targeting endpoint needs
   * to be different from the base stationType used with /ads.
   */
  targetingType?: TargetingStationTypes;
  /**
   * Represents the stream type we pass to the /ads endpoint
   */
  stationType: AdsStationTypes;
};

// The following types represent the minimal data shape we need to return
// an ad data object

type ArtistShape = {
  seedId: number;
  stationId: string;
  stationType: AdsStationTypes.Artist;
};

type TrackShape = {
  artistId: number;
  catalogType: 'track';
  stationId: string;
};

type FavoritesShape = {
  stationId: string;
  seedId: number;
  seedType: 'favorites';
};

type PodcastShape = {
  seedType: 'podcast';
  seedId: string;
};

type PlaylistShape = {
  seedType: 'playlistradio';
  reportingKey: string;
};

// Just so we don't get complaints about properties which don't exist on all shapes
type GenericShape = {
  stationType?: string;
  seedType?: string;
  catalogType?: string;
};

/**
 * Resolves a received station object (from resolveStation) into a consistent shape to use with playback ads
 * Hopefully with new playback this flow will be simpler, but for the time being let's make this flow as sane
 * and documented as possible.
 */
const resolveStationAdData = <
  T extends GenericShape &
    (ArtistShape | PlaylistShape | TrackShape | PodcastShape | PlaylistShape),
>(
  stationObject: T | null,
): ResolvedStationData | null => {
  if (!stationObject) return null;

  // Artist Stream
  if (stationObject.stationType === AdsStationTypes.Artist) {
    const { seedId, stationId } = stationObject as ArtistShape;

    return {
      stationType: AdsStationTypes.Artist,
      stationId: seedId,
      streamId: stationId,
    };
  }

  // Playlist Stream (includes MY_PLAYLIST)
  if (stationObject.stationType === STATION_TYPE.PLAYLIST_RADIO) {
    const { reportingKey: id } = stationObject as PlaylistShape;

    return {
      stationType: AdsStationTypes.Collection,
      stationId: id,
      streamId: id,
    };
  }

  // Track Stream
  if (stationObject.catalogType === STATION_TYPE.TRACK) {
    const { artistId, stationId } = stationObject as TrackShape;

    return {
      targetingType: TargetingStationTypes.Artist,
      stationType: AdsStationTypes.Track,
      stationId: artistId,
      streamId: stationId,
    };
  }

  // Favorites Radio
  if (stationObject.seedType === STATION_TYPE.FAVORITES) {
    const { stationId, seedId } = stationObject as FavoritesShape;
    return {
      targetingType: TargetingStationTypes.Favorite,
      stationType: AdsStationTypes.Favorites,
      stationId: seedId,
      streamId: String(stationId),
    };
  }

  // Podcast Stream
  if (stationObject.seedType === STATION_TYPE.PODCAST) {
    const { seedId } = stationObject as PodcastShape;

    return {
      stationType: AdsStationTypes.Podcast,
      stationId: seedId,
      streamId: seedId,
    };
  }

  return null;
};

export default resolveStationAdData;
