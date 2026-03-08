import Events from 'modules/Analytics/constants/events';
import factory from 'state/factory';
import init from 'vendor/gfkSensicSdk';
import { executeScript } from '@iheartradio/web.signal';
import { getCurrentlyLoadedUrl } from 'state/Player/selectors';
import { getUI } from 'state/UI/selectors';
import { getVolume } from 'state/Playback/selectors';
import { STATION_TYPE } from 'constants/stationTypes';
import type { EventTypeMap } from './types';
import type { TrackerConfig } from '@iheartradio/web.signal';

type GFKSENSICCONF = {
  media: string;
  url: string;
  type: string;
  optin?: boolean;
  logLevel?: string;
};
declare global {
  interface Window {
    gfkS2s?: any;
    gfkS2sConf?: undefined | GFKSENSICCONF;
    iHeartgfkAgent?: any;
  }
}

const store = factory();

const JWPLAYER = 'jw-player';

const gfkSensicSdkTracker = (
  enabled: boolean,
  script: string,
  isDev: boolean,
): TrackerConfig<EventTypeMap> => ({
  enabled, // Triggers on live stations

  name: 'gfk Sesic sdk',

  initialize: () => {},

  events: {
    [Events.PageView]: data => {
      const { pageName, stationName } = data;
      if (pageName === 'live_profile') {
        let liveStationName = stationName?.replace(/[^a-zA-Z0-9]+/g, '');
        liveStationName = `arn_${liveStationName}_audio_web`;
        const gfkS2sConf = window?.gfkS2sConf;
        if (gfkS2sConf) {
          gfkS2sConf.media = liveStationName;
        } else {
          executeScript(init(liveStationName, script, isDev));
        }
      }
    },

    [Events.StreamStart]: payload => {
      const seedType = payload.station?.get('seedType');
      window.iHeartgfkAgent?.stop();
      // Need to enable the gfk sensic only for live station
      if (seedType && seedType.toLowerCase() === STATION_TYPE.LIVE) {
        const player = window?.jwplayer(JWPLAYER);
        const streamId = getCurrentlyLoadedUrl(store.getState());
        const currentVolume = getVolume(store.getState());
        const { isFSPOpen } = getUI(store.getState());
        const currentTime = new Date().toISOString();
        const currentOffset = Math.round(Math.abs(player.getPosition() * 1000));
        const speed = player.getPlaybackRate();
        window.iHeartgfkAgent = window.gfkS2s?.getAgent();
        window.iHeartgfkAgent.playStreamLive(
          'music',
          currentTime,
          currentOffset,
          streamId,
          {
            screen: isFSPOpen.toString(),
            volume: currentVolume.toString(),
            speed,
          },
          { cliptype: 'live' },
        );
      }
    },

    [Events.Stop]: () => {
      window.iHeartgfkAgent?.stop();
    },

    [Events.StreamEnd]: () => {
      window.iHeartgfkAgent?.stop();
    },

    [Events.Mute]: () => {
      window.iHeartgfkAgent?.volume('0');
    },

    [Events.Unmute]: () => {
      const getCurrentVolume = () => getVolume(store.getState());
      window.iHeartgfkAgent?.volume(getCurrentVolume());
    },
  },
});

export default gfkSensicSdkTracker;
