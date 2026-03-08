/* eslint-disable camelcase */

import qs from 'qs';
import stringifyAttributes from './stringifyAttributes';
import { VAST_BASE_URL } from './constants';

type Dimensions = `${number}x${number}`;

/**
 * https://support.google.com/admanager/table/9749596?hl=en&ref_topic=2480647
 * These parameters are passed to the ad tag url builder and then encoded.
 */
export type VASTAdTagURLParameters = {
  /**
   * A random positive numerical value that is shared by multiple requests coming from the same page view.
   * The correlator is used to implement competitive exclusions, including those in cookieless environments.
   */
  correlator: number;
  /**
   * Optional key-value pairs used to set specific targeting.
   * https://support.google.com/admanager/answer/1080597
   */
  cust_params?: string | Record<string, string | number | null | undefined>;
  /**
   * Indicates an instream request, or that the request is specifically from a video player.
   */
  env: 'vp' | 'instream';
  /**
   * Indicates that the user is on the Ad Manager schema.
   */
  gdfp_req: 1;
  /**
   * Ad Unit
   */
  iu: string;
  /**
   * Ad output type
   */
  output:
    | 'vast'
    | 'xml_vast3'
    | 'xml_vast4'
    | 'vmap'
    | 'xml_vmap1'
    | 'xml_vmap1_vast3'
    | 'xml_vmap1_vast4';
  /**
   * Video size.
   * Should be a string dimension like so: '640x480'
   */
  sz: Dimensions;
  /**
   * Setting unviewed_position_start to 1 enabled delayed impressions
   */
  unviewed_position_start: 1;
  /**
   * URL of page displaying the ad
   */
  url?: string;
};

/**
 * This method takes in a customParams object and returns the encoded string
 */
function encodeCustomParameters(
  customParams: VASTAdTagURLParameters['cust_params'],
): string {
  if (!customParams) return '';
  return typeof customParams === 'string' ? customParams : (
      qs.stringify(stringifyAttributes(customParams))
    );
}

/**
 * Handles encoding of VAST ad tag url parameters. This method internally calls
 * `encodeCustomParameters`, so it is not necessary to explicitly pass it as a string.
 */
function encodeParameters(params: VASTAdTagURLParameters): string {
  const { cust_params, ...rest } = params;

  const paramObject = stringifyAttributes(
    rest as unknown as Record<string, string>,
  );

  if (cust_params) {
    paramObject.cust_params = encodeCustomParameters(cust_params);
  }

  return qs.stringify(paramObject);
}

/**
 * Creates a VAST Ad Tag URL. Returns encoded & decoded parameters for debugging.
 */
const createVASTAdTagURL = (parameters: VASTAdTagURLParameters) => {
  const encoded = encodeParameters(parameters);

  return {
    parameters: {
      encoded,
      decoded: parameters,
    },
    url: `${VAST_BASE_URL}?${encoded}`,
  };
};

export default createVASTAdTagURL;
