/* eslint-disable camelcase */

export const SUBSCRIPTION_SOURCE = {
  AMAZON: 'AMAZON',
  APPLE: 'APPLE',
  GOOGLE: 'GOOGLE',
  ROKU: 'ROKU',
};

export const SUBSCRIPTION_TYPE = {
  FREE: 'FREE',
  NONE: 'NONE',
  PLUS: 'PLUS',
  PREMIUM: 'PREMIUM',
};

// this value is passed to on-demand subscription iframes
// and is called ProductId when it is passed to AMP
export const ON_DEMAND_SUBSCRIPTION_ID = {
  IHEART_US_PLUS: 'IHEART_US_PLUS',
  IHEART_US_PLUS_TRIAL: 'IHEART_US_PLUS_TRIAL',
  IHEART_US_PREMIUM: 'IHEART_US_PREMIUM',
  IHEART_US_PREMIUM_099_FOR_3: 'IHEART_US_PREMIUM_099_FOR_3',
  IHEART_US_PREMIUM_12_MONTHS_FREE_TRIAL:
    'IHEART_US_PREMIUM_12_MONTHS_FREE_TRIAL',
  IHEART_US_PREMIUM_2_MONTHS_FREE_TRIAL:
    'IHEART_US_PREMIUM_2_MONTHS_FREE_TRIAL',
  IHEART_US_PREMIUM_3_MONTHS_FREE_TRIAL:
    'IHEART_US_PREMIUM_3_MONTHS_FREE_TRIAL',
  IHEART_US_PREMIUM_6_MONTHS_FREE_TRIAL:
    'IHEART_US_PREMIUM_6_MONTHS_FREE_TRIAL',
  IHEART_US_PREMIUM_ANNUAL: 'IHEART_US_PREMIUM_ANNUAL',
  IHEART_US_PREMIUM_FAMILY: 'IHEART_US_PREMIUM_FAMILY',
  IHEART_US_PREMIUM_TRIAL: 'IHEART_US_PREMIUM_TRIAL',
  IHEART_US_PROMO: 'IHEART_US_PROMO',
};

export const RECURLY_SUBSCRIPTION_ID = {
  IHEART_US_PLUS: 'plus',
  IHEART_US_PREMIUM: 'all_access',
  IHEART_US_PREMIUM_FAMILY: 'all_access_family',
};

export const RECURLY_PLAN_CODE_MAP = {
  all_access: 'All-Access',
  all_access_annual: 'All-Access Annual',
  all_access_family: 'All-Access Family',
  plus: 'Plus',
} as const;

// maps on-demand subscription ids to analytics-friendly strings
export const SUBSCRIPTION_ID_ANALYTICS_MAP = {
  IHEART_US_PLUS: 'Plus',
  IHEART_US_PLUS_TRIAL: 'Plus - 30-Day Free Trial',
  IHEART_US_PREMIUM: 'All Access',
  IHEART_US_PREMIUM_099_FOR_3: 'All Access - 3 Months 99 Cents',
  IHEART_US_PREMIUM_12_MONTHS_FREE_TRIAL: 'All Access - 12 Months Free Trial',
  IHEART_US_PREMIUM_2_MONTHS_FREE_TRIAL: 'All Access - 2 Months Free Trial',
  IHEART_US_PREMIUM_3_MONTHS_FREE_TRIAL: 'All Access - 3 Months Free Trial',
  IHEART_US_PREMIUM_6_MONTHS_FREE_TRIAL: 'All Access - 6 Months Free Trial',
  IHEART_US_PREMIUM_FAMILY: 'All Access Family Plan',
  IHEART_US_PREMIUM_TRIAL: 'All Access - 30-Day Free Trial',
  IHEART_US_PROMO: 'iHeart US Promotion',
};
