/* eslint-disable camelcase */

import buildQuery, { extractQSAsObject } from 'utils/queryStrings';
import url from 'url';

type StreamTypes =
  | 'hls_stream'
  | 'secure_hls_stream'
  | 'secure_mp3_pls_stream'
  | 'secure_pls_stream'
  | 'secure_shoutcast_stream'
  | 'shoutcast_stream'
  | string;

type Streams = { [key in StreamTypes]: string };

function createAddZipToStreamReducer(zip: string, streamid: string) {
  const addZipToStream = (
    streamsWithZip: Streams,
    [type, stream]: [StreamTypes, string],
  ): Streams => {
    const { protocol, host, pathname } = url.parse(stream);
    const queryObject = extractQSAsObject(stream);
    const newQueryString = buildQuery({
      ...queryObject,
      streamid,
      zip,
    });
    return {
      ...streamsWithZip,
      [type]: `${protocol}//${host}${pathname}${newQueryString}`,
    };
  };
  return addZipToStream;
}

/**
 * IHRWEB-14276 - "Pivot simulcast based on Fastly geo"
 *
 * if user is logged in and has a zipcode, request pivot stream with zip parameter
 * if user is logged in with no zipcode (ie google / facebook login) , user Fastly’s geo-zipcode from cookie
 * if user is anonymous use Fastly’s geo-zip from cookie.
 * only if fastly geo-zip is unset and there is no user zipcode, default to normal hls stream
 */
/**
 * IHRWEB-14759 - "Always run Pivot simulcast logic on O&O streams"
 *
 * above pivot comment now applicable to all owned and operated stations
 * station pivot whitelisting now maintained in external streaming system ZettaCloud
 */
export function addZipToOwnedAndOperatedStreams(
  streams: Streams,
  streamid: string,
  zip = '',
  isPivotEnabled: boolean | undefined,
  isOwnedAndOperated: boolean,
) {
  if (!isPivotEnabled || !isOwnedAndOperated) return { ...streams };

  const streamsWithZip = Object.entries(streams).reduce(
    createAddZipToStreamReducer(zip, streamid),
    {},
  );

  return streamsWithZip;
}

export function createStreamList(streams: Streams) {
  /* WEB-11055 - ZS -
   * this is the order that we want to try streams. They are presented to us by amp in the form
   * {
   *  [streamType]: streamUrl
   * }
   * so this allows for easy conversion to an array for attempts. We also don't consume certain streams
   * anymore and if we add/remove supported stream types, this would be where we would remove them.
   * The below object allows us to do ta mapping of stream types to jw-comprehensible stream types
   * which are required params for jw's API
   */
  const STREAM_ORDERING = [
    'secure_hls_stream',
    'secure_shoutcast_stream',
    'secure_pls_stream',
    'secure_mp3_pls_stream',
  ];

  const STREAM_TYPES = {
    secure_hls_stream: 'hls',
    secure_mp3_pls_stream: 'mp3',
    secure_pls_stream: 'aac',
    secure_shoutcast_stream: 'aac',
  };

  type ST = keyof typeof STREAM_TYPES;

  return STREAM_ORDERING.filter(n => streams[n as ST]).map(n => ({
    type: STREAM_TYPES[n as ST],
    url: streams[n as ST],
  }));
}
