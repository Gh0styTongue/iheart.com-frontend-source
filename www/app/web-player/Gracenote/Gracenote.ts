/**
 * This module is used to fetch track metadata for live stations. The initial
 * need for this module was to support track metadata for non-owned and
 * operated stations from our international partners. This module also works
 * for owned and operated stations but is shut off if we detect metadata coming
 * through the actual adswizz-provided stream. In other words, this module
 * works as a fallback for owned and operated stations.
 *
 */

import factory from 'state/factory';
import logger, { CONTEXTS } from 'modules/Logger';
import transport from 'api/transport';
import { getAmpUrl } from 'state/Config/selectors';
import { getCurrentTrackMeta } from './services';
import { LiveStation } from 'state/Live/types';
import { STATION_TYPE } from 'constants/stationTypes';

type Track = {
  albumId: number;
  albumTitle: string;
  artistId: number;
  artistName: string;
  duration: number;
  explicitLyrics: boolean;
  imageUrl: string;
  id: number;
  title: string;
  trackId: number;
  trackTitle: string;
  type: 'track';
} | null;

class Gracenote {
  ampUrl: string = getAmpUrl(factory().getState());

  duration = 5000;

  station?: LiveStation;

  subscriptions: Array<(track: Track) => undefined> = [];

  timeout: NodeJS.Timeout | null = null;

  async dispatch(station: LiveStation): Promise<void> {
    this.station = station;
    await this.fetchMetadata();
  }

  fetchMetadata = async (): Promise<void> => {
    clearTimeout(this.timeout!);

    if (!this.station || this.station.type !== STATION_TYPE.LIVE) return;

    try {
      let { data } = await transport(
        getCurrentTrackMeta({
          ampUrl: this.ampUrl,
          id: this.station.id,
        }),
      );

      if (data !== undefined) {
        let track: Track = {
          albumId: data.albumId,
          albumTitle: data.album,
          artistId: data.artistId,
          artistName: data.artist,
          duration: data.trackDuration,
          explicitLyrics: data.explicitLyrics,
          imageUrl: data.imagePath,
          id: data.trackId,
          title: data.title,
          trackId: data.trackId,
          trackTitle: data.title,
          type: STATION_TYPE.TRACK as 'track',
        };

        for (let i = 0; i < this.subscriptions.length; i += 1) {
          this.subscriptions[i](track);
        }

        data = null;
        track = null;
      }

      this.timeout = setTimeout(this.fetchMetadata, this.duration);
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.PLAYBACK, CONTEXTS.GRACENOTE], error, {}, errObj);
    }
  };

  subscribe(cb: (track: Track) => undefined): void {
    if (typeof cb !== 'function') {
      const errObj = new Error(
        'Single argument to gracenote.subscribe must be a callback function.',
      );
      logger.error(
        [CONTEXTS.PLAYBACK, CONTEXTS.GRACENOTE],
        errObj.message,
        {},
        errObj,
      );
      return;
    }

    this.subscriptions = [...this.subscriptions, cb];
  }

  unsubscribe(): void {
    clearTimeout(this.timeout!);
    this.subscriptions = [];
  }
}

export default Gracenote;
