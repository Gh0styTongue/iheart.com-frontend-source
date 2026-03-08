import { loadScript } from 'utils/loadScript';
import type { EventTypeMap } from './types';
import type { TrackerConfig } from '@iheartradio/web.signal';

const SCRIPT = 'http://www.google-analytics.com/ga.js';
const SSL_SCRIPT = 'https://ssl.google-analytics.com/ga.js';

type GoogleAnalyticsConfig = {
  account: string;
  domain: string;
};

const googleAnalyticsTracker = (
  config: GoogleAnalyticsConfig,
  enabled: boolean,
): TrackerConfig<EventTypeMap> => ({
  enabled,

  name: 'Google Analytics',

  initialize: async () => {
    const script = window.location.protocol === 'http:' ? SCRIPT : SSL_SCRIPT;

    window._gaq = [
      ['_setAccount', config.account],
      ['_setDomainName', config.domain],
      ['_trackPageview'],
    ];

    await loadScript(script);
  },

  events: () => {},
});

export default googleAnalyticsTracker;
