import cookie from 'js-cookie';
import globalData, {
  DayOfWeek,
  Data as GlobalData,
} from './helpers/globalData';
import Queue from './Queue';
import { get, merge, set } from 'lodash-es';
import { parse } from 'qs';
import { v4 as uuid } from 'uuid';
import { waitForDocumentLoaded } from '@iheartradio/web.signal';
import type { DataLayer, EventName } from './types';
import type {
  InAppMessageExitData,
  InAppMessageOpenData,
} from './helpers/inAppMessage';
import type { Data as ItemSelectedData } from './helpers/itemSelected';
import type { Data as OpenCloseData } from './helpers/openClose';
import type { Data as PageViewData } from './helpers/pageView';
import type { Data as PasswordData } from './helpers/password';
import type { Data as PaymentData } from './helpers/payment';
import type { RegGate as RegGateData } from './helpers/regGate';
import type { Data as SaveDeleteData } from './helpers/saveDelete';
import type { Data as ShareData } from './helpers/share';
import type { Data as ShuffleData } from './helpers/shuffle';
import type { Data as StationData } from './helpers/station';
import type { Data as ThumbingData } from './helpers/thumbing';
import type { Data as UpsellData } from './helpers/upsell';

declare global {
  interface Window {
    referrer?: string;
  }
}

type Config = {
  onTrack: (
    action: EventName,
    event: any,
    dataLayer: DataLayer,
  ) => Promise<void> | void;
  timeout: number;
};

type TrackData = ((a: DataLayer) => Record<string, any>) | Record<string, any>;

/**
 * Combination of a `track` call's parameters.
 * Used by the queue mechanism to store track calls while waiting for `window._satellite`
 */
interface TrackItem {
  action: EventName;
  data: TrackData;
}

/**
 * Because we do not initialize this class server-side, many class properties and methods are optional.
 *
 * TODO Explore why this class does not get initialized server-side so we can improve these typings.
 * Could potentially make all the module functions noops on the server which would allow us to be
 * more strict with the types.
 */

class Analytics {
  afterDequeue?: Promise<void>;

  isLoaded = false;

  isReady = false;

  isCrawler = false;

  isTracking = false;

  onTrack?: Config['onTrack'];

  queue: Queue<TrackItem> = new Queue<TrackItem>();

  requestId: number | null = null;

  timeout?: Config['timeout'];

  timeoutId: number | null = null;

  setGlobalData?: (a: GlobalData) => void;

  trackClick?: (a: string) => Promise<void>;

  trackCreateContent?: (a: StationData) => Promise<void>;

  trackInAppMessageExit?: (a: InAppMessageExitData) => Promise<void>;

  trackInAppMessageOpen?: (a: InAppMessageOpenData) => Promise<void>;

  trackItemSelected?: (a: ItemSelectedData) => Promise<void>;

  trackOpenClosePlayer?: (a: OpenCloseData) => Promise<void>;

  trackPageView?: (a: PageViewData) => Promise<void>;

  trackPassword?: (a: PasswordData) => Promise<void>;

  trackPaymentExit?: (a: { exitType: string }) => Promise<void>;

  trackPaymentOpen?: (a: PaymentData) => Promise<void>;

  trackRegGateExit?: (a: string) => Promise<void>;

  trackRegGateOpen?: (a: RegGateData) => Promise<void>;

  trackSaveDelete?: (a: SaveDeleteData) => Promise<void>;

  trackShare?: (a: ShareData) => Promise<void>;

  trackShuffle?: (a: ShuffleData) => Promise<void>;

  trackThumbing?: (a: ThumbingData) => Promise<void>;

  trackUpsellExit?: (a: {
    destination: string;
    exitType: string;
    campaign?: string;
  }) => Promise<void>;

  trackUpsellOpen?: (a: UpsellData) => Promise<void>;

  constructor(config: Config) {
    if (!__CLIENT__) {
      return;
    }
    window.analyticsData ??= {};
    this.onTrack = config.onTrack;
    this.timeout = config.timeout;
    this.afterDequeue = this.load();
  }

  /**
   * We need to clear certain namespaces between each event. This api allows us to do so and replace
   * the namespace with any value see fit.
   */
  clear(path: Array<string>, value: any = {}) {
    set(window.analyticsData, path, value);
  }

  static create(config: Config): Analytics {
    return new Analytics(config);
  }

  async dequeue(): Promise<void> {
    const trackItem = this.queue.dequeue();
    if (!trackItem) return;
    await this.track(trackItem.action, trackItem.data);
  }

  /**
   * In the event we need to reach into window.analyticsData, we use this method to do so.
   */
  get(path?: Array<string> | null | undefined, fallback?: any) {
    if (!path) return window.analyticsData;
    return get(window.analyticsData, path, fallback);
  }

  /**
   * When we initialize this module, we call this method to make sure initial global data and
   * variables are in place.
   */
  async load(): Promise<void> {
    await waitForDocumentLoaded();

    const date = new Date();

    const timezone = new Intl.DateTimeFormat(undefined, {
      timeZoneName: 'short',
    })
      .formatToParts()
      .find(part => part.type === 'timeZoneName')?.value;

    // while it's redundant to include deviceId in the globalData payload below as getDeviceId()
    // also sets the value of deviceID in globalData, for clarity's sake it is included
    const deviceId = this.getDeviceId();

    const referer = window?.referrer;
    const refererDomain = (referrer => {
      if (referrer) {
        try {
          const { hostname } = new URL(referrer);
          return hostname;
        } catch {
          return undefined;
        }
      }
      return undefined;
    })(referer);
    const browserHeight = window?.innerHeight;
    const browserWidth = window?.innerWidth;
    const screenResolution = (() => {
      try {
        const { availHeight, availWidth } = window?.screen ?? {};
        return availHeight && availWidth ?
            `${availWidth}x${availHeight}`
          : undefined;
      } catch {
        // swallow the error
      }
      return undefined;
    })();

    /**
     * Here we are setting some global data that is required for every analytics call we fire.
     */
    this.set(
      globalData({
        appSessionId: uuid(),
        browserHeight: browserHeight ? `${browserHeight}px` : undefined,
        browserWidth: browserWidth ? `${browserWidth}px` : undefined,
        dayOfWeek: (
          [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
          ] as Array<DayOfWeek>
        )[date.getDay()],
        gpcEnabled:
          'globalPrivacyControl' in window.navigator ?
            (window.navigator.globalPrivacyControl as boolean)
          : false,
        hourOfDay: date.getHours(),
        id: deviceId,
        isPlaying: false,
        querystring: parse(window.location.search, { ignoreQueryPrefix: true }),
        referer,
        refererDomain,
        reportedDate: date.getTime(),
        screenOrientation:
          window.matchMedia?.('(orientation: portrait)').matches ?
            'portrait'
          : 'landscape',
        screenResolution,
        timezone,
        userAgent: window.navigator.userAgent,
        visitorId: null,
        isCrawler: this.isCrawler,
      }),
    );

    /**
     * Once we have loaded, we can now flush the queue of any events that have already fired.
     */
    this.isLoaded = true;

    await this.dequeue();
  }

  /**
   * We use this api to set global data within window.analyticsData. This global data is merged into
   * each event that is fired off to Igloo.
   */
  set(data: Record<string, any> = {}): void {
    const { events = {}, global = {}, ...rest } = data;
    merge(window.analyticsData, { events, global }, { global: rest });
  }

  /**
   * getDeviceId defined separately here to keep analytics & a/b testing in sync:
   * a/b testing may ask for value before analytics would have determined it in load()
   */
  getDeviceId(): string {
    let deviceId = this.get(
      ['global', 'device', 'id'],
      cookie.get('DEVICE_ID'),
    );

    if (!deviceId || String(deviceId) === 'undefined') {
      const yearPlusOne = new Date().getUTCFullYear() + 1;
      const expiryDate = new Date();
      expiryDate.setUTCFullYear(yearPlusOne);
      deviceId = uuid();
      const forceHost = new URL(document.location.href).hostname.endsWith(
        'iheart.com',
      );
      cookie.set('DEVICE_ID', deviceId, {
        expires: expiryDate,
        path: '/',
        ...(forceHost ? { domain: 'iheart.com' } : {}),
      });
    }

    this.set(globalData({ id: deviceId }));

    return deviceId;
  }

  /**
   * This method allows us to determine exactly when we wish to flush the queue. Some times there is
   * data we need to retrieve from amp before fire any events.
   */
  setReadyState(val = true): void {
    this.isReady = val;
  }

  setIsCrawler(val = false): void {
    this.isCrawler = val;
  }

  /**
   * This is the most important method of the analytics. Most developers are either going to use
   * this method directly or an abstraction that sits on top of it. This method fires events off to
   * Igloo, which is the essentially the entire point of this code.
   */
  async track(action: EventName, data: TrackData = {}): Promise<void> {
    /**
     * If our dependent libraries have yet to load or if we are already tracking another event, we
     * push the current event onto the queue.
     */
    if (!this.isLoaded || this.isTracking) {
      this.queue.enqueue({ action, data });
      return this.afterDequeue;
    }

    this.isTracking = true;

    /**
     * In order to pass a pageName value with every track call (trackAction does not include it by default),
     * we must pull pageName from the last page_view call and include it manually.
     */
    const events = window.analyticsData?.events;

    const pageName =
      // Get pageName from active event if it exists
      events?.active?.pageName ??
      // Otherwise get pageName from last page_view event
      events?.page_view?.[(events?.page_view?.length ?? 0) - 1]?.pageName;

    const event = {
      pageName,
      ...(typeof data === 'function' ? data(window.analyticsData) : data),
    };

    this.clear(['events', 'active']);

    /** We need to set dynamic global data that changes with each event. */
    this.set({
      event: {
        capturedTimestamp: Date.now(),
      },
      events: {
        [action]: [...this.get(['events', action], []), event],
        active: { action, ...event },
      },
      ...globalData({
        callId: uuid(),
        sequenceNumber:
          Number(this.get(['global', 'session', 'sequenceNumber'], 0)) + 1,
      }),
    });

    /**
     * Then we fire off a subsequent call to igloo, which is decoupled from this module in case
     * we need to add more side effects in the future. See this modules associated index.js file.
     */
    if (this.onTrack) {
      await this.onTrack(action, event, this.get());
    }

    this.isTracking = false;

    /**
     * Lastly, we empty the queue if there were any events that tried to fire while isTracking
     * was true.
     */
    return this.dequeue();
  }
}

export default Analytics;
