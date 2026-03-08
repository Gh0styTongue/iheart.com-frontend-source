import invariant from 'invariant';
import { createContext } from 'react';
import { EventsHandler } from '@iheartradio/web.signal';
import { EventTypeMap } from 'trackers/types';

const defaultTrack = () => {
  invariant(__CLIENT__, 'No track calls should be made server-side.');
};

const TrackersContext = createContext<{ track: EventsHandler<EventTypeMap> }>({
  track: defaultTrack,
});

export default TrackersContext;
