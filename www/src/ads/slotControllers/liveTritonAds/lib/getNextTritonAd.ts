import logger, { CONTEXTS } from 'modules/Logger';
import parseVAST from 'iab-vast-parser';
import qs from 'qs';
import ValidCompanions from 'ads/slotControllers/liveTritonAds/lib/ValidCompanions';
import type {
  Companion,
  CompanionAds,
  Creative,
  HTMLResource,
  IFrameResource,
  StaticResource,
  ValidCompanionHeight,
  ValidDisplayCompanion,
  VAST,
} from 'iab-vast-parser';

/**
 * checks the querystring for a tritonAdType param to force display of that
 * type.  Defaults to true if the param is not provided.
 * @param type the display type to look for in the querystring
 */
function queryIsType(type: string) {
  const testQuery = qs.parse(window.location.search).tritonAdType;

  return !testQuery || testQuery === type;
}

/**
 * get a flattened array of all companion ads in the vast response.
 * @param vast a parsed vast response (xml tree converted to js objects)
 * */
function getAllCompanions(vast: VAST) {
  const creatives = vast?.ads.get?.(0)?.creatives?.toArray?.();

  if (!creatives) return [];

  const companionCreatives = creatives.filter(
    creative => !!creative.companionAds,
  ) as Array<Creative<CompanionAds>>;

  return companionCreatives
    .map(creative => creative.companionAds.companions)
    .flat();
}

/**
 * checks if a companion's dimensions are supported.
 * @param companion companion object to check
 */
function companionHasValidDimensions(
  companion: Companion,
): companion is ValidDisplayCompanion {
  return (
    companion.width === ValidCompanions.COMPANION_WIDTH &&
    (ValidCompanions.ACCEPTABLE_COMPANION_HEIGHTS as Array<number>).includes(
      companion.height,
    )
  );
}

/**
 * iterate through an array of companions and filter for those with invalid dimensions for the slot.
 * @param companions array of all companions returned in the VAST response.
 */
function getValidCompanions(companions: Array<Companion | null>) {
  const validCompanions = new ValidCompanions();
  let index = 0;

  while (index < companions.length && !validCompanions.isFull()) {
    const companion = companions[index];

    if (!!companion && companionHasValidDimensions(companion)) {
      validCompanions.add(companion);
    }

    index += 1;
  }

  return validCompanions;
}

export const parseVastEndpointFromContext = (
  context: string,
): string | undefined => {
  let vastEndpointString: string | null = null;
  try {
    vastEndpointString = atob(context);
  } catch (error) {
    if (error instanceof DOMException) {
      logger.error(
        [CONTEXTS.ADS, CONTEXTS.PLAYBACK_ADS],
        {
          message: 'Could not extract VAST endpoint',
          stack: error.stack,
          endpointUrl: context,
        },
        { endpointUrl: context },
        error,
      );
    }
  }

  if (typeof vastEndpointString === 'string') {
    try {
      return new URL(vastEndpointString).toString();
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          [CONTEXTS.ADS, CONTEXTS.PLAYBACK_ADS],
          {
            message: 'VAST endpoint is not a valid URL',
            endpoint: vastEndpointString,
          },
          {},
          error,
        );
      }
    }
  }

  return undefined;
};

/**
 * fetches potential companions from triton, filters for validity and then returns a specific companion.
 * priority is given first to the type in the tritonAdType query param provided the companion has one.
 * without a query param, it attempts to first render an iframe if one is available followed by raw html
 * and then an image/anchor ad.
 * @param context string used to fetch VAST response, retrieved from live stream metadata
 */
export default async function getNextTritonAd(context: string): Promise<{
  height?: ValidCompanionHeight;
  companion:
    | ValidDisplayCompanion<IFrameResource>
    | ValidDisplayCompanion<StaticResource>
    | ValidDisplayCompanion<HTMLResource>;
  type: 'iframe' | 'html' | 'static';
} | null> {
  const vastEndpoint = parseVastEndpointFromContext(context);

  if (!vastEndpoint) return null;

  const rawResponse = await fetch(vastEndpoint);

  // 404s don't throw.
  if (rawResponse.status === 404)
    throw new Error(`failed to fetch VAST ad from ${vastEndpoint}`);

  const response = await rawResponse.text();

  // parse the response vast string into an object representation,
  // extract the companions and filter for the ones we can display
  // based on available space and our set of supported ad sizes.
  const vast = parseVAST(response);
  const allCompanions = getAllCompanions(vast);
  const validCompanions = getValidCompanions(allCompanions);

  const { dimensionCompanions, height } =
    validCompanions.getAvailableDimension();

  if (dimensionCompanions?.iframe && queryIsType('iframe')) {
    return {
      height,
      companion: dimensionCompanions.iframe,
      type: 'iframe',
    };
  } else if (dimensionCompanions?.html && queryIsType('html')) {
    return {
      companion: dimensionCompanions.html,
      type: 'html',
    };
  } else if (dimensionCompanions?.staticResource && queryIsType('static')) {
    return {
      companion: dimensionCompanions.staticResource,
      type: 'static',
    };
  }

  return null;
}
