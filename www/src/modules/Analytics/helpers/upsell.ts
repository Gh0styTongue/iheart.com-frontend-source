/* eslint-disable camelcase */

import * as UPSELL_FROM from '../constants/upsellFrom';
import Events from '../constants/events';
import qs from 'qs';
import { composeEventData, namespace, property } from '../factories';
import { PlanCodes } from 'components/Recurly';

export function getUpsellFromTile(tileName: 'albums' | 'artists' | 'songs') {
  const upsellFromMap = {
    albums: UPSELL_FROM.MY_MUSIC_ALBUMS_TILES,
    artists: UPSELL_FROM.MY_MUSIC_ARTISTS_TILES,
    songs: UPSELL_FROM.MY_MUSIC_SONGS_TILES,
  };
  return upsellFromMap[tileName];
}

export function getPromotionSubscriptionTierMap(subscriptionType: PlanCodes) {
  const promotionSubscriptionTierMap = {
    all_access: UPSELL_FROM.ALL_ACCESS,
    all_access_annual: UPSELL_FROM.ALL_ACCESS_ANNUAL,
    all_access_family: UPSELL_FROM.ALL_ACCESS_FAMILY,
    plus: UPSELL_FROM.PLUS,
  };

  return promotionSubscriptionTierMap[subscriptionType];
}

export function getUpsellFromQueryParam(
  queryParam: string,
): [number, string] | [number, string, string] | [] {
  const upsellFromMap: Record<
    string,
    [number, string] | [number, string, string]
  > = {
    '172': [UPSELL_FROM.LINK_FROM_AFFILIATE_SITE_PLUS, UPSELL_FROM.DEEPLINK],
    '272': [
      UPSELL_FROM.LINK_FROM_AFFILIATE_SITE_ALL_ACCESS,
      UPSELL_FROM.DEEPLINK,
    ],
    '311': [UPSELL_FROM.ONBOARDING_DEEPLINK, UPSELL_FROM.DEEPLINK],
    '320': [UPSELL_FROM.ONBOARDING_PUSH, UPSELL_FROM.PUSH],
    '333': [UPSELL_FROM.LINK_FROM_HELP_SITE, UPSELL_FROM.DEEPLINK],
    '335': [
      UPSELL_FROM.FOR_YOU_UPGRADE_BANNER,
      UPSELL_FROM.BANNER,
      UPSELL_FROM.ALL_ACCESS,
    ],
    '352': [UPSELL_FROM.LINK_FROM_LOCAL_SITE, UPSELL_FROM.DEEPLINK],
    '354': [UPSELL_FROM.LINK_FROM_LOCAL_SITE, UPSELL_FROM.DEEPLINK],
    '358': [UPSELL_FROM.LINK_FROM_CUSTOMER_CARE, UPSELL_FROM.EMAIL],
    '359': [UPSELL_FROM.LINK_FROM_AD, UPSELL_FROM.DEEPLINK],
    '364': [UPSELL_FROM.LINK_FROM_PLUS_RESET_PASSWORD, UPSELL_FROM.EMAIL],
    '365': [UPSELL_FROM.LINK_FROM_RESET_PASSWORD, UPSELL_FROM.EMAIL],
    '366': [UPSELL_FROM.LINK_FROM_PREMIUM_RESET_PASSWORD, UPSELL_FROM.EMAIL],
    '5000': [UPSELL_FROM.LINK_FROM_SAMSUNG, UPSELL_FROM.DEEPLINK],
    '372': [UPSELL_FROM.LINK_FROM_AFFILIATE_SITE_BOTH, UPSELL_FROM.DEEPLINK],
    '54': [UPSELL_FROM.HEADER_UPGRADE_BUTTON, UPSELL_FROM.BANNER],
  };
  return upsellFromMap[queryParam as keyof typeof upsellFromMap] || [];
}

export type Data = {
  destination: string;
  promotionSubscriptionTier?: string;
  sku?: string;
  upsellFrom?: number;
  upsellType?: string;
  vendor?: string;
};

export type UpsellOpen = {
  upsell: Data;
};

export function getUpsellOpenAnalyticsData({
  destination,
  promotionSubscriptionTier,
  sku,
  upsellFrom,
  upsellType,
  vendor,
}: Data) {
  const querystring = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  return composeEventData(Events.UpsellExit)(
    namespace('upsell')(
      property('destination', destination, true),
      property('promotionSubscriptionTier', promotionSubscriptionTier),
      property('sku', sku || querystring.subscriptionId),
      property('upsellFrom', upsellFrom, true),
      property('upsellType', upsellType, true),
      property('vendor', vendor),
    ),
  );
}

export function getLatestUpsellData(upsellOpenArray: Array<UpsellOpen> = []) {
  const [upsellOpen] = upsellOpenArray.slice(-1);
  return upsellOpen ? upsellOpen.upsell : undefined;
}

export function getExitUpsellFrom(
  latestUpsellData: Data | null | undefined,
  querystring: {
    upsellFrom: string;
  },
) {
  const [upsellFrom] = getUpsellFromQueryParam(querystring.upsellFrom);
  const hasUpsellFrom =
    latestUpsellData ? latestUpsellData.upsellFrom : upsellFrom;
  return hasUpsellFrom ?? '';
}

export function getExitUpsellType(
  latestUpsellData: Data | null | undefined,
  querystring: {
    upsellFrom: string;
  },
) {
  const [, upsellType] = getUpsellFromQueryParam(querystring.upsellFrom);

  return latestUpsellData ? latestUpsellData.upsellType : upsellType;
}

export function getExitPromotionSubscriptionTier(
  latestUpsellData: Data | null | undefined,
) {
  return latestUpsellData ?
      latestUpsellData.promotionSubscriptionTier
    : UPSELL_FROM.GENERAL;
}

export function getExitVendor(latestUpsellData: Data | null | undefined) {
  return latestUpsellData ? latestUpsellData.vendor : UPSELL_FROM.NATIVE;
}

export function getExitDestination(latestUpsellData: Data | null | undefined) {
  return latestUpsellData ?
      latestUpsellData.destination
    : UPSELL_FROM.NEW_SCREEN;
}

export function getExitSkuData(latestUpsellData: Data | null | undefined) {
  return latestUpsellData ? latestUpsellData.sku : undefined;
}

export function getExitSku(querystring: { subscriptionId: string }) {
  return querystring.subscriptionId;
}

// This funciton is called when user dismisses upgrade modal, or "exit" upgrade page by clicking link, or hitting back button.
export function getUpsellExitAnalyticsData({
  exitType,
  destination,
  campaign,
}: {
  campaign?: string;
  destination: string;
  exitType: string;
}) {
  return ({
    events,
  }: {
    events: {
      payment_frame_open: Array<any>;
      upsell_open: Array<UpsellOpen>;
    };
  }) => {
    const querystring = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const { payment_frame_open, upsell_open } = events;

    return composeEventData(Events.UpsellExit)(
      namespace('upsell')(
        property(
          'upsellFrom',
          getExitUpsellFrom(getLatestUpsellData(upsell_open), querystring),
          true,
        ),
        property(
          'upsellType',
          getExitUpsellType(getLatestUpsellData(upsell_open), querystring),
          true,
        ),
        property(
          'promotionSubscriptionTier',
          getExitPromotionSubscriptionTier(
            getLatestUpsellData(payment_frame_open),
          ) ||
            getExitPromotionSubscriptionTier(getLatestUpsellData(upsell_open)),
        ),
        property('vendor', getExitVendor(getLatestUpsellData(upsell_open))),
        property(
          'destination',
          destination || getExitDestination(getLatestUpsellData(upsell_open)),
          true,
        ),
        property(
          'sku',
          getExitSkuData(getLatestUpsellData(payment_frame_open)) ||
            getExitSku(querystring),
        ),
        property('exitType', exitType, true),
        property('campaign', campaign),
      ),
    );
  };
}
