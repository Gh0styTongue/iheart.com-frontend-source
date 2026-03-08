import brazeInit from './initialize';
import events from './eventsHandler';
import { TrackerConfig } from '@iheartradio/web.signal';
import type { BrazeConfig } from './initialize';
import type { EventTypeMap } from 'trackers/types';

const brazeTracker = ({
  apiKey,
  baseUrl,
  isDev,
  appVersion,
  enabled,
}: BrazeConfig): TrackerConfig<EventTypeMap> => ({
  enabled,

  name: 'Braze',

  initialize: brazeInit({
    apiKey,
    baseUrl,
    isDev,
    appVersion,
    enabled,
  }),

  events,
});

export default brazeTracker;
