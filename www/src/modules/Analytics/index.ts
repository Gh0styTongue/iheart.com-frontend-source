import Analytics from './Analytics';
import clickData from './helpers/clickData';
import createContent from './helpers/createContent';
import events from './constants/events';
import globalData from './helpers/globalData';
import itemSelected from './helpers/itemSelected';
import onTrack from './onTrack';
import openClose from './helpers/openClose';
import pageView from './helpers/pageView';
import password from './helpers/password';
import saveDelete from './helpers/saveDelete';
import share from './helpers/share';
import shuffle from './helpers/shuffle';
import thumbing from './helpers/thumbing';
import {
  getInAppMessageExit,
  getInAppMessageOpen,
} from './helpers/inAppMessage';
import {
  getPaymentExitAnalyticsData,
  getPaymentOpenAnalyticsData,
} from './helpers/payment';
import {
  getRegGateExitAnalyticsData,
  getRegGateOpenAnalyticsData,
} from './helpers/regGate';
import {
  getUpsellExitAnalyticsData,
  getUpsellOpenAnalyticsData,
} from './helpers/upsell';

export const Events = events;

const analytics = Analytics.create({ onTrack, timeout: 240000 });

/**
 * The following are abstractions over the the top of the track and set methods for convenience.
 * If you are going to add any additional events to our analytics api, please add the
 * abstraction/helper below. Thank you.
 */

analytics.setGlobalData = data => analytics.set(globalData(data));

analytics.trackClick = data => analytics.track(Events.Click, clickData(data));

analytics.trackCreateContent = async data =>
  analytics.track(Events.CreateContent, createContent(data));

analytics.trackInAppMessageExit = async data =>
  analytics.track(Events.InAppMessageExit, getInAppMessageExit(data));

analytics.trackInAppMessageOpen = async data =>
  analytics.track(Events.InAppMessageOpen, getInAppMessageOpen(data));

analytics.trackItemSelected = async data =>
  analytics.track(Events.ItemSelected, itemSelected(data));

analytics.trackOpenClosePlayer = async data =>
  analytics.track(Events.OpenClosePlayer, openClose(data));

analytics.trackPageView = async data =>
  analytics.track(Events.PageView, pageView(data));

analytics.trackPassword = async data =>
  analytics.track(Events.Password, password(data));

analytics.trackPaymentExit = async data =>
  analytics.track(Events.PaymentFrameExit, getPaymentExitAnalyticsData(data));

analytics.trackPaymentOpen = async data =>
  analytics.track(Events.PaymentFrameOpen, getPaymentOpenAnalyticsData(data));

analytics.trackRegGateExit = async data =>
  analytics.track(Events.RegGateExit, getRegGateExitAnalyticsData(data));

analytics.trackRegGateOpen = async data =>
  analytics.track(Events.RegGateOpen, getRegGateOpenAnalyticsData(data));

analytics.trackSaveDelete = async data =>
  analytics.track(Events.SaveDelete, saveDelete(data));

analytics.trackShare = async data => analytics.track(Events.Share, share(data));

analytics.trackShuffle = async data =>
  analytics.track(Events.Shuffle, shuffle(data));

analytics.trackThumbing = async data =>
  analytics.track(Events.Thumbing, thumbing(data));

analytics.trackUpsellExit = async data =>
  analytics.track(Events.UpsellExit, getUpsellExitAnalyticsData(data));

analytics.trackUpsellOpen = async data =>
  analytics.track(Events.UpsellOpen, getUpsellOpenAnalyticsData(data));

export default analytics;
