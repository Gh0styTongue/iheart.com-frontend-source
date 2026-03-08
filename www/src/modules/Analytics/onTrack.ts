import logger, { CONTEXTS } from 'modules/Logger';
import transport from 'api/transport';
import { DataLayer, EventName } from './types';
import { merge } from 'lodash-es';
import { postEvent } from './services';

/**
 * For each event we send to Adobe, we also need to send to Igloo, which is a data warehouse we
 * use for rendundancy and reporting.
 */
async function onTrack(
  action: EventName,
  event: any,
  { config, global }: DataLayer,
) {
  const payload = merge(
    {},
    global,
    {
      action,
      event: {
        loggedTimestamp: Date.now(),
      },
    },
    event,
  );

  try {
    await transport(postEvent(config.iglooUrl, payload));
  } catch (error: any) {
    const errObj = error instanceof Error ? error : new Error(error);
    logger.error(
      [CONTEXTS.ANALYTICS, action],
      {
        errors: error?.response?.data?.errors ?? {},
        message: error.message,
        payload,
      },
      {},
      errObj,
    );
  }
}

export default onTrack;
