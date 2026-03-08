import createTransport from 'api/transport/createTransport';
import Events from 'modules/Analytics/constants/events';
import factory from 'state/factory';
import qs from 'qs';
import { asyncIsPrivacyOptOut } from 'trackers/privacyOptOut';
import { createCacheBust, getProfileParams, getSid } from './helpers';
import type { EventsHandler, EventTypeMap } from '../types';
import type { TrackerConfig } from '@iheartradio/web.signal';

const tritonLTTracker = (
  enabled: boolean,
  config: any,
): TrackerConfig<EventTypeMap> => {
  let pingInterval = 6000; // 60 seconds
  let tritonInterval: number | undefined;
  let tritonGuid: string | undefined;

  const tritonUrl = 'https://lt110.tritondigital.com/lt';
  const transport = createTransport(factory);

  let sid: string | number | undefined; // triton station type id
  let vid: string | number; // profileId
  let profileParams: { gender?: string; yob?: number }; // yob, gender, etc
  let tritonParams: string; // query string including above params
  let tracking = false; // this 'tracking' state helps identify when we're unmuting or unpausing from the current station
  let stationId: string | number; // storing so we know when the station has changed

  const getTritonQSParams = () =>
    qs.stringify(
      {
        ...qs.parse(`sid=${sid}&cb=${createCacheBust()}&vid=${vid}`),
        ...profileParams,
      },
      { addQueryPrefix: true },
    );

  // we ping triton on the ping interval with the guid from the start tracking response
  const pingTriton = () => {
    if (tritonGuid) {
      transport(`${tritonUrl}?guid=${tritonGuid}&cb=${createCacheBust()}`);
    }
  };

  // we stop the tracking and prepare for a new stream start by clearing the ping interval and guid
  const endTracking = () => {
    tracking = false;
    clearInterval(tritonInterval);
    tritonInterval = undefined;
    pingTriton(); // one last ping to mark the end of the stream
    tritonGuid = undefined;
  };

  // start tracking a new stream
  const startTritonTracking = () => {
    endTracking(); // clear old ping intervals
    if (sid) {
      tracking = true;
      transport(`${tritonUrl}${tritonParams}`).then(res => {
        const { data } = res;

        // triton returns a ping interval (seconds) and unique id as a comma delimited string
        const [pingIntervalSeconds, guid] = data.split(',');
        if (pingIntervalSeconds)
          pingInterval = parseInt(pingIntervalSeconds, 10) * 1000;
        if (guid) tritonGuid = guid;
        // per triton spec, we send a ping using the guid on the interval. We clear the interval if the stream pauses, stops, or mutes
        tritonInterval = window.setInterval(pingTriton, pingInterval);
      });
    }
  };

  // event handler for new streams: play, unpause
  const startTracking = async (
    opts: EventTypeMap[typeof Events.StreamStart],
  ) => {
    if (Object.keys(opts).length) {
      const {
        profile,
        session: { profileId },
        station,
      } = opts;
      const type = station.get('type');
      const id = station.get('id');
      sid = getSid(type ?? '', config);
      vid = profileId;

      if (!tracking || id !== stationId) {
        stationId = id;
        /**
         * RequestURL (HTTP GET):https://sampleURL.tritondigital.com/lt?sid={sid}&vid={vid}&cb={cb}&dev={dev}&dist={dist}&ss={ss}&ps={ps}&autoplay={0/1}&hasads={0/1}&ctype={ctype}
         * Example:https://publisherABC.tritondigital.com/lt?sid=1234&vid=10001256&cb=32226688&dev=android&dist=addregatorXYZ&ss=publisherABC&ps=thisandroidapp&autoplay=0&hasads=1&ctype=live
         */

        // start new stream
        profileParams = getProfileParams(profile);
        tritonParams = getTritonQSParams();
        startTritonTracking();
      }
    }
  };

  // event handler for unmute. We use the params we have stored, but start a new stream to get a new guid
  const resumeTracking = ({
    isWarmingUp,
    playingState,
  }: EventTypeMap[typeof Events.Unmute]) => {
    if (!tracking && playingState === 'PLAYING' && !isWarmingUp) {
      tritonParams = getTritonQSParams();
      startTritonTracking();
    }
  };

  const events: EventsHandler = async (eventName, payload) => {
    if (await asyncIsPrivacyOptOut()) {
      return;
    }

    switch (eventName) {
      case Events.StreamStart:
        startTracking(payload as EventTypeMap[typeof Events.StreamStart]);
        break;
      case Events.Unmute:
        resumeTracking(payload as EventTypeMap[typeof Events.Unmute]);
        break;
      case Events.Mute:
      case Events.Pause:
      case Events.Stop:
      case Events.StreamEnd:
        endTracking();
        break;
      default:
        break;
    }
  };

  // this is an unusual signal implementation. We do not need to load a vendor script or add anything to global/window
  // we only need to listen to events
  return {
    enabled,
    name: 'TritonLT',
    initialize: () => {},
    events,
  };
};

export default tritonLTTracker;
