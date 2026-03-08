import Events from 'modules/Analytics/constants/events';
import init from 'vendor/facebookPixel';
import logger from 'modules/Logger';
import { asyncIsPrivacyOptOut } from './privacyOptOut';
import { executeScript, TrackerConfig } from '@iheartradio/web.signal';
import { stationTypeMap } from 'state/Stations/constants';
import type { EventKeyMap, EventName } from 'modules/Analytics/types';
import type { EventsHandler, EventTypeMap } from './types';

/**
 * Trackers often expect different names for the same events. We have a single
 * source of truth in `EVENTS` so we need to map those to what the tracker is
 * expecting in some cases.
 */
const eventKeyMap: Partial<EventKeyMap> = {
  [Events.PageView]: 'PageView',
  [Events.ViewContent]: 'ViewContent',
  [Events.Subscribe]: 'Subscribe',
  [Events.StreamStart]: 'play',
};

/**
 * Facebook takes some custom events which are tracked differently than their standard events
 * The payload is the same however the sdk will complain
 */
const fbEventMap: {
  [key: string]: string;
} = {
  [`${eventKeyMap[Events.PageView]}`]: 'track',
  [`${eventKeyMap[Events.StreamStart]}`]: 'trackCustom',
  [`${eventKeyMap[Events.Subscribe]}`]: 'track',
  [`${eventKeyMap[Events.ViewContent]}`]: 'track',
};

// This function wraps the facebook tracking function to provide a
// more consistent interface.
const fbTrack = ({
  event,
  data,
}: {
  event: (typeof eventKeyMap)[keyof typeof eventKeyMap];
  data: unknown;
}) => {
  const fbq = window?.fbq;
  const type = fbEventMap[event as keyof typeof fbEventMap];
  return fbq ? fbq(type, event, data) : null;
};

// We only care to track the following events for FB Pixel.
// This will differ for each tracker.
const trackedEvents = [
  Events.PageView,
  Events.StreamStart,
  Events.Subscribe,
  Events.ViewContent,
];

// This should prevent multiple play events for the same track.
let previousTrackId: number | undefined = 0;

const events: EventsHandler = async (eventName, payload) => {
  if (await asyncIsPrivacyOptOut()) {
    return;
  }
  if (trackedEvents.includes(eventName)) {
    const mappedEventName = eventKeyMap[eventName as EventName] ?? eventName;

    logger.info(
      'Tracking FB Pixel:',
      mappedEventName,
      payload as Record<string, unknown>,
    );
    if (mappedEventName === 'play') {
      // IHRWEB-16147 Web and Widget use the same tacker implementation but send different payloads
      // TODO: Widget should have a separate tracker implementation.
      // web
      const { station, podcastEpisodeData } =
        payload as EventTypeMap[typeof Events.StreamStart];
      // widget
      const { id, name, title, type } = payload as {
        id: string;
        name: string;
        title: string;
        type: string;
      };

      const fbqData: {
        episodeId?: number | string;
        episodeName?: string;
        id: string;
        name: string;
        type?: string;
      } = {
        id: station?.get('id') ?? id,
        name: station?.get('artistName') ?? station?.get('name') ?? name,
        type: station?.get('seedType') ?? type,
      };

      if (fbqData.type === stationTypeMap.PODCAST) {
        fbqData.episodeId = podcastEpisodeData?.id ?? id;
        fbqData.episodeName = podcastEpisodeData?.title ?? title;
      }

      /**
       * We should not track this the multiple times the stream start happens
       * Only if the previous event was not the same track as this current event
       */
      // @ts-ignore Ignoring here because all stations have a track, however its not worth changing all the types at this point.
      const trackId: number | undefined = station?.get('track')?.id;
      if (previousTrackId !== trackId) {
        /**
         * IHRWEB-15458 They want to trigger the view content
         * on the play event which is also mapped to play.
         */
        fbTrack({ event: mappedEventName, data: fbqData });
        fbTrack({ event: eventKeyMap[Events.ViewContent], data: fbqData });
        previousTrackId = trackId;
      }
    } else {
      fbTrack({ event: mappedEventName, data: payload });
    }
  }
};

const facebookPixelTracker = (
  fbPixelId: string,
  enabled: boolean,
): TrackerConfig<EventTypeMap> => ({
  enabled,

  name: 'Facebook Pixel',

  initialize: async () => {
    if (await asyncIsPrivacyOptOut()) {
      return;
    }
    logger.info('initializing FB Pixel...', { fbPixelId });
    executeScript(init(fbPixelId));
  },

  events,
});

export default facebookPixelTracker;
