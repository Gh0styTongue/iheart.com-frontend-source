import logger, { CONTEXTS } from 'modules/Logger';
import nodeUrl from 'url';
import radioEditRedirect from './radioEditRedirect';
import { get } from 'lodash-es';

async function getRadioEditRedirect(
  transport,
  { siteUrl, apiEndpoint, pathname, originalQuery },
) {
  let results = {};
  try {
    results = await transport(radioEditRedirect(apiEndpoint, pathname));
  } catch (error) {
    /*
      we'll catch the error here if radioedit fails and let the response lifecycle
      serve up 404's as needed
    */
    const errObj = new Error('failed to get redirect from radioedit');
    logger.error(CONTEXTS.SERVER, errObj.message, error, errObj);

    return {};
  }

  const redirect = get(results, ['data', 'data', 'sites', 'find']);

  if (get(redirect, ['configByLookup', 'redirect'])) {
    const {
      canonicalHostname,
      configByLookup: {
        redirect: { destination, permanent },
      },
    } = redirect;

    const {
      query: redirectQuery,
      hostname = canonicalHostname,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      search: _,
      ...parsedRedirect
    } = nodeUrl.parse(destination, true, true);

    const { hostname: siteHostname } = nodeUrl.parse(siteUrl, true, true);

    return {
      httpStatus: permanent ? 301 : 302,
      url: nodeUrl.format({
        ...parsedRedirect,
        hostname:
          !hostname || hostname.includes('www.iheart.com') ?
            siteHostname.replace(/https?:\/\//, '')
          : hostname,
        protocol: 'https',
        query: {
          ...(redirectQuery || {}),
          ...originalQuery,
        },
      }),
    };
  }

  return {};
}

export default getRadioEditRedirect;
