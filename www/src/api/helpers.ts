import createTaggedUrl from 'api/createTaggedUrl';
import qs from 'qs';
import { AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
import { curry, flow, get, isPlainObject, omit } from 'lodash-es';
import { v4 as uuid } from 'uuid';

export default function composeRequest(
  ...fns: Array<(a: Partial<AxiosRequestConfig>) => Partial<AxiosRequestConfig>>
): (config?: Partial<AxiosRequestConfig>) => AxiosRequestConfig {
  return (config = { url: '' }) => flow(...fns)(config);
}

function baseMethod(
  method: Method,
  requestObject: Partial<AxiosRequestConfig>,
): Partial<AxiosRequestConfig> {
  return {
    ...requestObject,
    method,
  };
}

function baseHeader(
  header: string,
  value: string | number | null,
  requestObject: Partial<AxiosRequestConfig>,
): {
  headers: {
    [a: string]: string;
  };
} {
  const currentHeaders = requestObject.headers || {};
  return {
    ...requestObject,
    headers: {
      ...currentHeaders,
      [header]: value,
    },
  };
}

function baseBody<T>(
  body: T,
  requestObject: Partial<AxiosRequestConfig>,
): {
  data?: T;
} {
  const currentBody = requestObject.data || {};
  return {
    ...requestObject,

    data:
      isPlainObject(currentBody) ?
        {
          ...currentBody,
          ...body,
        }
      : body,
  };
}

function baseFormBody(
  body: {
    [a: string]: string | number | boolean;
  },
  { data, ...requestObject }: Partial<AxiosRequestConfig>,
): {
  data?: string;
} {
  const currentBody = qs.parse(data);
  return {
    ...requestObject,
    data: qs.stringify({ ...currentBody, ...body }),
  };
}

function baseUrl(
  url: string,
  requestObject: Partial<AxiosRequestConfig>,
): {
  url: string;
} {
  return {
    ...requestObject,
    url,
  };
}

function baseQuery(
  query: {
    [a: string]: string | number | boolean | undefined | null;
  },
  requestObject: Partial<AxiosRequestConfig>,
): {
  params: {
    [a: string]: string;
  };
} {
  const params = requestObject.params || {};

  return {
    ...requestObject,
    params: {
      ...params,
      ...query,
    },
  };
}

function baseTransformResponse(
  fn: AxiosTransformer,
  requestObject: Partial<AxiosRequestConfig>,
): {
  transformResponse: Array<AxiosTransformer>;
} {
  let transformers = requestObject.transformResponse || [];
  if (!Array.isArray(transformers))
    transformers = [requestObject.transformResponse as AxiosTransformer];
  // there's a known issue with how flow types and flow interfaces interact documented here: https://github.com/facebook/flow/issues/5851
  // we should keep an eye out for when that gets fixed
  return {
    ...requestObject,
    transformResponse: [...transformers, fn],
  };
}

function baseTransformRequest(
  fn: AxiosTransformer,
  requestObject: Partial<AxiosRequestConfig>,
): {
  transformRequest: Array<AxiosTransformer>;
} {
  let transformers = requestObject.transformRequest || [];
  if (!Array.isArray(transformers))
    transformers = [requestObject.transformRequest as AxiosTransformer];
  // there's a known issue with how flow types and flow interfaces interact documented here: https://github.com/facebook/flow/issues/5851
  // we should keep an eye out for when that gets fixed
  return {
    ...requestObject,
    transformRequest: [...transformers, fn],
  };
}

function baseParamsSerializer(
  fn: (params: Record<string, any>) => string,
  requestObject: Partial<AxiosRequestConfig>,
): {
  paramsSerializer: (params: Record<string, any>) => string;
} {
  if (requestObject.paramsSerializer)
    return {
      ...requestObject,
      paramsSerializer: flow(fn, qs.parse, requestObject.paramsSerializer),
    };
  return {
    ...requestObject,
    paramsSerializer: fn,
  };
}

export const query = curry(baseQuery);
export const method = curry(baseMethod);
export const header = curry(baseHeader);
export const body = curry(baseBody);
export const formBody = curry(baseFormBody);
export const url = curry(baseUrl);
export const transformResponse = curry(baseTransformResponse);
export const transformRequest = curry(baseTransformRequest);
export const paramsSerializer = curry(baseParamsSerializer);

function baseAuthHeaders(
  profileId: number | string | null,
  sessionId: number | string | null,
  requestObject: Partial<AxiosRequestConfig>,
): {
  headers: {
    [a: string]: string;
  };
} {
  return flow(
    header('X-Ihr-Profile-Id', profileId),
    header('X-Ihr-Session-Id', sessionId),
    header('X-User-Id', profileId),
    header('X-Session-Id', sessionId),
  )(requestObject);
}

export function baseLocaleHeaders(
  lang: string,
  country: string,
  requestObject: Partial<AxiosRequestConfig>,
): {
  headers: {
    [a: string]: string;
  };
} {
  const locale = lang.indexOf('-') >= 0 ? lang : `${lang}-${country}`;

  return flow(header('X-Locale', locale))(requestObject);
}

export function baseHostHeaders(
  host: string,
  requestObject: Partial<AxiosRequestConfig>,
): {
  headers: {
    [a: string]: string;
  };
} {
  return flow(header('X-hostName', host))(requestObject);
}

export function baseAppCountryHeader(
  country: string,
  requestObject: Partial<AxiosRequestConfig>,
): {
  headers: {
    [a: string]: string;
  };
} {
  return flow(header('x-ihr-app-country', country))(requestObject);
}

function baseOptions(
  options: {
    bustCache: boolean;
  },
  requestObject: Partial<AxiosRequestConfig>,
): {
  params: {
    [a: string]: string;
  };
} {
  const bustCache: { bustCache: boolean | string } | Record<string, unknown> =
    get(options, 'bustCache', false) ? { bustCache: uuid() } : {};

  return flow(query(bustCache as { bustCache: string }))(requestObject);
}

function baseRequestName(
  requestName: string,
  requestObject: Partial<AxiosRequestConfig>,
): {
  params?: {
    paramsSerializer: (params: any) => string;
    requestName: string;
  };
} {
  // For flow to let us pass requestName on to interceptors we need to drop it into the query
  // however we don't actually want it to be sent so we strip it out as part of serializing.
  return composeRequest(
    query({ requestName }),
    paramsSerializer(params => qs.stringify(omit(params, ['requestName']))),
  )(requestObject);
}

export const authHeaders = curry(baseAuthHeaders);
export const localeHeaders = curry(baseLocaleHeaders);
export const hostHeaders = curry(baseHostHeaders);
export const appCountryHeader = curry(baseAppCountryHeader);
export const options = curry(baseOptions);
export const requestName = curry(baseRequestName);

/** AV - 1/3/19 - WEB-12718
 * docs on tagged Templates: https: *developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates
 * syntax for consuming this function is is:
 *    urlTagged`a/path/with/${{ requestNameValue: urlValue }}/and/stuff/${{ differentRequestNameValue: differentUrlValue }}`.
 * the strings argument will contain:
 *    [ 'a/path/with/', '/and/stuff' ]
 * the params argument will contain
 *    [ { requestNameValue: urlValue }, { differentRequestNameValue: differentUrlValue } ]
 * the returned requestObject from the nested function will have additional properties equivalent to:
 *    {
 *      url: `a/path/with/${ urlValue }/and/stuff/${ differentUrlValue }`,
 *      params: {requestName: `a/path/with/${ requestNameValue }/and/stuff/${ differentRequestNameValue }`}
 *    }
 */
export function urlTagged(
  strings: TemplateStringsArray,
  ...params: Array<{
    [a: string]: string | number;
  }>
) {
  const [composedUrl, composedRequestName] = createTaggedUrl(
    strings,
    ...params,
  );

  return function addRequestNameAndUrl(
    requestObject: Partial<AxiosRequestConfig>,
  ): AxiosRequestConfig {
    return composeRequest(
      requestName(composedRequestName),
      url(composedUrl),
    )(requestObject);
  };
}

/**
 * AA - 7/27/2020 IHRWEB-14835
 * Users are getting logged out when trying to link a social login that is already tied to
 * another IHR account. This is due to an interceptor that clears the user's session wihtout
 * refreshing the page if there is a 4xx error in an api call. This transform tells the interceptor
 * not to do anything.
 */
export function unauthorizedInterceptorTransform(
  useUnauthorizedInterceptor = true,
) {
  return transformResponse(data => ({
    ...JSON.parse(data),
    useUnauthorizedInterceptor,
  }));
}
