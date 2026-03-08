import { reduce } from 'lodash-es';

export const HOST_PREFIXES = {
  BETA: 'beta.',
  MASTER: 'master.',
  SANDBOX: 'sandbox.',
  STAGE: 'stage.',
  WWW: 'www.',
};

export const WEB_HOSTS = reduce(
  HOST_PREFIXES,
  (memo, prefix, name) => ({ ...memo, [name]: `${prefix}iheart.com` }),
  {},
);

export const WEB_HOSTS_SET = new Set(Object.values(WEB_HOSTS));

export const IHR_REFERER_HOST_NAMES = ['iheart.com'];
