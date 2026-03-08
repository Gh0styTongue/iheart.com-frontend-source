import factory from 'state/factory';
import MediaChannel from './MediaChannel';
import { getChromecastAppId } from 'state/Config/selectors';

const store = factory();

const chromecast = new MediaChannel({
  config: {
    appId: getChromecastAppId(store.getState()),
    deviceType: 'web',
  },
});

export default chromecast;
