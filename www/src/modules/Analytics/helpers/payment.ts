/* eslint-disable camelcase */

import * as UPSELL_FROM from '../constants/upsellFrom';
import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { GlobalData } from './globalData';
import { locationMap } from '../constants/regGateFrom';

export function getTriggerLocation(context: string) {
  return locationMap[context as keyof typeof locationMap] || [];
}

export type Data = {
  deeplink?: string;
  destination: string | undefined;
  exitType?: string;
  promotionSubscriptionTier: string;
  sku?: string;
  trigger?: string;
  upsellFrom: number | undefined;
  upsellType: string | undefined;
  vendor: string | undefined;
};

export type UpsellOpen = {
  upsell: Data;
};

export function createLatestPaymentSelector(key: keyof Data) {
  return function getUpsell(upsellOpenArray: Array<UpsellOpen>) {
    if (upsellOpenArray) {
      const [{ upsell }] = upsellOpenArray.slice(-1);
      return upsell[key];
    }
    return null;
  };
}

export const getLatestPaymentDeeplink = createLatestPaymentSelector('deeplink');

export const getLatestPaymentUpsellDestination =
  createLatestPaymentSelector('destination');

export const getLatestPaymentSku = createLatestPaymentSelector('sku');

export const getLatestPaymentUpsellFrom =
  createLatestPaymentSelector('upsellFrom');

export const getLatestPaymentPromotionSubscriptionTier =
  createLatestPaymentSelector('promotionSubscriptionTier');

export const getLatestPaymentType = createLatestPaymentSelector('upsellType');

export const getLatestPaymentVendor = createLatestPaymentSelector('vendor');

export function getPaymentOpenAnalyticsData(data: Data) {
  return function paymentOpenAnalyticsData({
    events,
    global,
  }: {
    events: {
      upsell_open: Array<UpsellOpen>;
    };
  } & GlobalData) {
    const { upsell_open } = events;
    return composeEventData(Events.PaymentFrameOpen)(
      namespace('upsell')(
        property(
          'deeplink',
          events.upsell_open ? UPSELL_FROM.DEEPLINK : undefined,
        ),
        property(
          'destination',
          data.destination || getLatestPaymentUpsellDestination(upsell_open),
          true,
        ),
        property(
          'promotionSubscriptionTier',
          data.promotionSubscriptionTier ||
            getLatestPaymentPromotionSubscriptionTier(upsell_open),
        ),
        property('sku', global.querystring?.subscriptionId),
        property(
          'upsellFrom',
          data.upsellFrom || getLatestPaymentUpsellFrom(upsell_open),
          true,
        ),
        property(
          'upsellType',
          data.upsellType ||
            getLatestPaymentType(upsell_open) ||
            UPSELL_FROM.TRIGGERED,
          true,
        ),
        property('vendor', data.vendor || getLatestPaymentVendor(upsell_open)),
      ),
    );
  };
}

export function getPaymentExitAnalyticsData({
  exitType,
}: {
  exitType: string;
}) {
  return function paymentExitAnalyticsData({
    events,
  }: {
    events: {
      payment_frame_open: Array<UpsellOpen>;
      upsell_exit: Array<UpsellOpen>;
    };
  }) {
    const { payment_frame_open, upsell_exit } = events;
    return composeEventData(Events.PaymentFrameExit)(
      namespace('upsell')(
        property(
          'destination',
          getLatestPaymentUpsellDestination(payment_frame_open),
          true,
        ),
        property('deeplink', getLatestPaymentDeeplink(payment_frame_open)),
        property('exitType', exitType, true),
        property(
          'promotionSubscriptionTier',
          getLatestPaymentPromotionSubscriptionTier(upsell_exit),
        ),
        property('sku', getLatestPaymentSku(payment_frame_open)),
        property(
          'upsellFrom',
          getLatestPaymentUpsellFrom(payment_frame_open),
          true,
        ),
        property('upsellType', getLatestPaymentType(payment_frame_open), true),
        property('vendor', getLatestPaymentVendor(payment_frame_open)),
      ),
    );
  };
}
