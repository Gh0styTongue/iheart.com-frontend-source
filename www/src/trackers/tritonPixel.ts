import Events from 'modules/Analytics/constants/events';
import logger, { CONTEXTS } from 'modules/Logger';
import reduxFactory from 'state/factory';
import whenPopulated from 'utils/whenPopulated';
import { getBlockedPIIBehaviors } from 'state/Profile/selectors';
import { getListenHistoryReceived } from 'state/Stations/selectors';
import { getTritonSecureToken, setTritonPartnerIds } from 'state/Ads/actions';
import { loadScript } from 'utils/loadScript';
import type { EventTypeMap } from './types';
import type { TrackerConfig } from '@iheartradio/web.signal';

type TritonPixelConfig = {
  domain: string;
};

const store = reduxFactory();

const tritonPixelTracker = (
  config: TritonPixelConfig,
  enabled: boolean,
): TrackerConfig<EventTypeMap> => ({
  enabled,
  name: 'Triton Pixel Tracker',
  initialize: async () => {
    const hasBlockingType = await whenPopulated(
      store,
      getListenHistoryReceived,
    ).then(() => {
      return getBlockedPIIBehaviors(store.getState()).sanitizeStreams;
    });

    const script =
      hasBlockingType ?
        `${config.domain}&us_privacy=1-Y-`
      : `${config.domain}&us_privacy=1-N-`;

    try {
      await loadScript(script);
      await store.dispatch(setTritonPartnerIds());
    } catch (error) {
      logger.error(CONTEXTS.TRITON, error);
      throw error;
    }
  },

  events: {
    [Events.PageView]: async data => {
      const payload = data;
      try {
        if (payload.enableTritonToken) {
          await store.dispatch(getTritonSecureToken());
        }
      } catch (error) {
        logger.error(CONTEXTS.TRITON, error);
        throw error;
      }
    },
  },
});

export default tritonPixelTracker;
