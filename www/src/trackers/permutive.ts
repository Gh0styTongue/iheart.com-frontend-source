import logger from 'modules/Logger';
import { EventTypeMap } from './types';
import { isEmpty } from 'lodash-es';
import { TrackerConfig } from '@iheartradio/web.signal';

const permutiveTrackerInit = (enabled: boolean) => {
  const permutiveTrack = (event: string, data: unknown) => {
    const permutive = window?.permutive;
    return permutive ? permutive.track(event, data) : null;
  };

  const events = async (eventName: string, payload: unknown) => {
    if (eventName && !isEmpty(payload)) {
      logger.info(
        'Tracking Permutive:',
        eventName,
        payload as Record<string, unknown>,
      );
      permutiveTrack(eventName, payload);
    }
  };

  const permutiveTracker: TrackerConfig<EventTypeMap> = {
    enabled,
    name: 'Permutive',
    events,
  };

  return permutiveTracker;
};

export default permutiveTrackerInit;
