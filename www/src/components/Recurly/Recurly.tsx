import * as UPSELL_FROM from 'modules/Analytics/constants/upsellFrom';
import analytics from 'modules/Analytics';
import getScript from 'utils/getScript';
import logger, { CONTEXTS } from 'modules/Logger';
import qs from 'qs';
import { DefaultObj, PlanCodes } from './types';
import { fieldConfiguration, FieldConfiguration } from './config';
import { get } from 'lodash-es';
import {
  getPromotionSubscriptionTierMap,
  getUpsellFromQueryParam,
} from 'modules/Analytics/helpers/upsell';
import { Helmet } from 'react-helmet';

class Recurly {
  recurly: any;

  recurlyDidMount: boolean;

  configuration: FieldConfiguration;

  constructor() {
    this.recurly = false;
    this.recurlyDidMount = false;
    this.configuration = fieldConfiguration;
  }

  async load() {
    if (this.recurlyDidMount) return;
    // if this is client side run get script if not lets do it via helmet
    if (__CLIENT__) {
      await getScript('https://js.recurly.com/v4/recurly.js', null);
      this.recurlyDidMount = true;
      this.recurly = get(window, 'recurly');
    }
  }

  configure({ recurlyKey }: { recurlyKey: string }) {
    if (this.recurly) {
      this.recurly.configure({
        cors: true,
        fields: this.configuration,
        publicKey: recurlyKey,
      });
    }
  }

  async price({ planCode }: { planCode: string }) {
    const pricing = this.recurly.Pricing();
    const { price } = await pricing.plan(planCode, { quantity: 1 });
    return price.USD.unit_amount;
  }

  /**
   * Recurly token requires a call back
   * This is why this method is done in this way
   */
  token(form: HTMLFormElement | null): Promise<{
    token?: string;
    errors?: { [key: string]: unknown; mainMessage: string };
  }> {
    return new Promise(res => {
      this.recurly.token(
        form,
        (err: { [key: string]: any }, token: { id: string; type: string }) => {
          if (err) {
            const errorObj: DefaultObj = {};
            let mainMessage = err.message;
            err.details.forEach(
              ({ field, messages }: { field: string; messages: [string] }) => {
                const errMessage = `${field}: ${messages.join('')}`;
                if (mainMessage.toLowerCase() !== errMessage.toLowerCase()) {
                  mainMessage += ` ${errMessage}. `;
                }
                errorObj[field] = messages.join(' ');
              },
            );

            return res({ errors: { ...errorObj, mainMessage } });
          }
          return res({ token: token.id });
        },
      );
    });
  }

  analyticsOpen({ planCode }: { planCode: PlanCodes }) {
    let pageHost = '';
    let pageURL = '';
    let ReferrerHost = '';
    let ReferrerHref = '';

    const queryParam = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const [upsellFrom, upsellType] = getUpsellFromQueryParam(
      queryParam.upsellFrom,
    );

    try {
      const { host, href } = new URL(document.referrer);
      ReferrerHost = host;
      ReferrerHref = href;
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error(CONTEXTS.RECURLY_ANALYTICS, e, {}, errObj);
    }
    pageHost = ReferrerHost;
    pageURL = ReferrerHref;

    if (analytics.trackPageView) {
      analytics.trackPageView({
        contentFrame: 'page',
        inNetwork: pageHost.includes('iheart').toString(),
        pageHost,
        pageName: 'upsell',
        pageURL,
      });

      analytics.trackPageView({
        contentFrame: 'page',
        inNetwork: pageHost.includes('iheart').toString(),
        pageHost,
        pageName: 'subscription_credit_card',
        pageURL,
      });
    }

    const promotionSubscriptionTier = getPromotionSubscriptionTierMap(planCode);

    if (analytics.trackPaymentOpen) {
      analytics.trackPaymentOpen({
        destination: UPSELL_FROM.NEW_SCREEN,
        promotionSubscriptionTier,
        upsellFrom: upsellFrom || undefined,
        upsellType: upsellType || undefined,
        vendor: upsellType || undefined,
      });
    }

    if (analytics.trackUpsellOpen) {
      analytics.trackUpsellOpen({
        destination: UPSELL_FROM.NEW_SCREEN,
        promotionSubscriptionTier: UPSELL_FROM.ALL_ACCESS,
        sku: UPSELL_FROM.IHEART_US_PREMIUM_TRIAL,
        upsellFrom: upsellFrom || undefined,
        upsellType: upsellType || undefined,
        vendor: upsellType || undefined,
      });
    }
  }

  analyticsExit() {
    if (analytics.trackPaymentExit) {
      analytics.trackPaymentExit({ exitType: UPSELL_FROM.UPGRADE_FAILURE });
    }

    if (analytics.trackUpsellExit) {
      analytics.trackUpsellExit({
        destination: UPSELL_FROM.NEW_SCREEN,
        exitType: UPSELL_FROM.DISMISS,
      });
    }
  }

  helmet() {
    return (
      <Helmet
        script={[
          {
            src: 'https://js.recurly.com/v4/recurly.js',
            type: 'text/javascript',
          },
        ]}
      />
    );
  }
}

export default new Recurly();
