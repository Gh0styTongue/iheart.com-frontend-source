import brazeTracker from './Braze';
import comScoreTracker from './comScore';
import countryCodes from 'constants/countryCodes';
import facebookPixelTracker from './facebookPixel';
import getStore from 'state/factory';
import gfkSensicSdkTracker from './gfkSensicSdk';
import googleAnalyticsTracker from './googleAnalytics';
import logger from 'modules/Logger';
import lotameTracker from './lotame';
import outbrainPixelTracker from './outbrainPixel';
import permutiveTrackerInit from './permutive';
import tritonLTTracker from './tritonLT';
import tritonPixelTracker from './tritonPixel';
import { defineTrackers, TrackerConfig } from '@iheartradio/web.signal';
import {
  getBrazeAppKey,
  getBrazeBaseUrl,
  getBrazeEnabled,
} from 'state/Config/selectors';
import { getEnv, getIsMobile, getVersion } from 'state/Environment/selectors';
import {
  getTritonConfigDesktop,
  getTritonConfigMobile,
} from 'state/Ads/selectors';
import type { EventTypeMap } from './types';
import type { State } from 'state/types';

// This should be removed once the Player is rewritten. Optimally, this logic should happen
// in the client-side 'hydrate' step, like in the widget, not like this. It should happen
// on the render level before routing, after Redux Provider initialization.   (Caleb W. 9/17/20)

const currentState = getStore().getState() as State;

const brazeBaseUrl = getBrazeBaseUrl(currentState);
const brazeKey = getBrazeAppKey(currentState);
const currentEnv = getEnv(currentState) !== 'prod';
const brazeVersion = getVersion(currentState) ?? '';
const brazeEnabled = getBrazeEnabled(currentState);

const comScoreId = currentState.analytics?.comScore?.customerId ?? '';
const comScoreEnabled = currentState.analytics?.comScore?.enabled ?? false;
const comScorePageviewCandidateUrl =
  currentState.analytics?.comScore?.pageview_candidate_url ?? '/api/comscore';

const fbPixelId = currentState.config?.facebookPixel?.id;
const fbPixelEnabled = currentState.config?.facebookPixel?.enabled ?? false;

const googleAnalyticsAccount =
  currentState.analytics?.googleAnalytics?.account ?? '';
const googleAnalyticsDomain =
  currentState.analytics?.googleAnalytics?.domain ?? '';
const googleAnalyticsEnabled =
  currentState.analytics?.googleAnalytics?.enabled ?? false;

const lotameClientId = currentState.ads?.lotame?.clientId ?? '';
const lotameNamespace = currentState.ads?.lotame?.thirdPartyId ?? '';
const lotameEnabled = currentState.ads?.lotame?.enabled;
const legacyLotameEnabled = currentState.ads?.lotame?.legacyLotame;

const obPixelId = currentState.config?.outbrainPixel?.id;
const obPixelEnabled = currentState.config?.outbrainPixel?.enabled ?? false;

const permutiveEnabled = currentState.config?.countryCode === countryCodes.CA;

const gfkSensicSdkFlagEnabled =
  currentState?.features?.flags?.gfkSensic ?? false;
const gfkSensicSdkEnabled = currentState.config?.gfkSensicSdk?.enabled ?? false;
const gfkSensicSdkScript = currentState.config?.gfkSensicSdk?.script ?? '';

const tritonConfig =
  getIsMobile(currentState) ?
    getTritonConfigMobile(currentState)
  : getTritonConfigDesktop(currentState);

const tritonPixelScript = currentState.ads?.customAds?.tritonScript ?? '';

// Check if we're on the client before executing these tracker factory functions - some of them rely on browser globals.
const trackerConfigs: Array<TrackerConfig<EventTypeMap>> =
  __CLIENT__ ?
    [
      brazeTracker({
        apiKey: brazeKey,
        appVersion: brazeVersion,
        baseUrl: brazeBaseUrl,
        isDev: currentEnv,
        enabled: brazeEnabled,
      }),
      comScoreTracker(
        comScoreId,
        !!comScoreId && comScoreEnabled,
        comScorePageviewCandidateUrl,
      ),
      facebookPixelTracker(fbPixelId, !!fbPixelId && fbPixelEnabled),
      googleAnalyticsTracker(
        {
          account: googleAnalyticsAccount,
          domain: googleAnalyticsDomain,
        },
        !!googleAnalyticsAccount &&
          !!googleAnalyticsDomain &&
          googleAnalyticsEnabled,
      ),
      lotameTracker(
        lotameClientId,
        lotameNamespace,
        !!lotameClientId && lotameEnabled && !legacyLotameEnabled,
      ),
      outbrainPixelTracker(obPixelId, !!obPixelId && obPixelEnabled),
      permutiveTrackerInit(permutiveEnabled),
      tritonLTTracker(true, tritonConfig),
      tritonPixelTracker({ domain: tritonPixelScript }, !!tritonPixelScript),
      gfkSensicSdkTracker(
        gfkSensicSdkEnabled && gfkSensicSdkFlagEnabled,
        gfkSensicSdkScript,
        currentEnv,
      ),
    ]
  : [];

const trackers = defineTrackers<EventTypeMap>(trackerConfigs, { logger });

export default trackers;
