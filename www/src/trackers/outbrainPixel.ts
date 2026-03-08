import Events from 'modules/Analytics/constants/events';
import init from 'vendor/outbrain';
import logger from 'modules/Logger';
import { asyncIsPrivacyOptOut } from './privacyOptOut';
import { executeScript, TrackerConfig } from '@iheartradio/web.signal';
import type { EventKeyMap, EventName } from 'modules/Analytics/types';
import type { EventsHandler, EventTypeMap } from './types';

const outbrainPixelTrackerInit = (pixelId: string, enabled: boolean) => {
  const obTrack = (event: string, data: unknown) => {
    const outbrain = window?.obApi;
    return outbrain ? outbrain('track', event, data) : null;
  };

  const isContentPage = (): boolean => {
    return window.location.pathname.includes('/content/');
  };

  const willTrackEvent = (eventName: EventName) => {
    const trackedEvents: Partial<EventKeyMap> = {
      [Events.PageView]: 'PAGE_VIEW',
      [Events.Play]: 'Play',
    };

    return trackedEvents[eventName] ?? null;
  };

  const events: EventsHandler = async (eventName, payload) => {
    if ((await asyncIsPrivacyOptOut()) || !isContentPage()) {
      return;
    }
    const mappedEvent = willTrackEvent(eventName as EventName);
    if (mappedEvent) {
      logger.info(
        'Tracking Outbrain Pixel:',
        mappedEvent,
        payload as Record<string, unknown>,
      );
      if (
        isContentPage() &&
        typeof payload === 'object' &&
        payload !== null &&
        'outbrain' in payload
      ) {
        obTrack(mappedEvent, payload);
      }
    }
  };

  const outbrainPixelTracker: TrackerConfig<EventTypeMap> = {
    enabled,

    name: 'Outbrain Pixel',

    initialize: async () => {
      const isOptout = await asyncIsPrivacyOptOut();
      if (isOptout || !isContentPage()) {
        return;
      }
      executeScript(init(pixelId));
    },

    events,
  };

  return outbrainPixelTracker;
};

export default outbrainPixelTrackerInit;
