import logger, { CONTEXTS } from 'modules/Logger';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { get, omit } from 'lodash-es';

export function logResponseSuccess<T>(response: AxiosResponse<T>): unknown {
  const {
    headers: requestHeaders = {},
    method = 'get',
    url,
    params = {},
    data: requestData,
  } = get(response, 'config', {}) as AxiosRequestConfig;
  const {
    status,
    statusText,
    headers: responseHeaders,
    data: responseData,
  } = response;
  const { requestName = url } = params;
  if (requestName && __CLIENT__)
    logger.info(
      CONTEXTS.TRANSPORT,
      [status, method.toUpperCase(), requestName].join(':'),
      {
        method,
        query: omit(params, 'requestName'),
        requestData,
        requestHeaders,
        requestName,
        responseData,
        responseHeaders,
        status,
        statusText,
        toRum: true,
        url,
      },
    );
  return response;
}

export function logResponseFailure(error: any): any {
  const errObj = error instanceof Error ? error : new Error(error);
  if (!error || !error.config) {
    // we only get metadata from the request/response for http errors
    // in the case of other runtime errors we get the raw js error and
    // won't have access to the data we need to construct our standardized
    // http error log.
    logger.error(CONTEXTS.TRANSPORT, error, {}, errObj);
  } else {
    const {
      headers: requestHeaders = {},
      method = 'get',
      url,
      params,
      data: requestData,
    } = get(error, 'config', {});
    const {
      headers: responseHeaders,
      statusText,
      status,
      data: responseData,
    } = get(error, 'response', {});

    const requestName = get(params, 'requestName');
    if (requestName) {
      logger.error(
        CONTEXTS.TRANSPORT,
        [status, method.toUpperCase(), requestName].join(':'),
        {
          axios: {
            code: error.code,
            message: error.message,
            stack: error.stack,
          },
          method,
          query: omit(params, 'requestName'),
          requestData,
          requestHeaders,
          requestName,
          responseData,
          responseHeaders,
          status,
          statusText,
          tags: [`${method} - ${requestName}`, status, statusText],
          url,
        },
        errObj,
      );
    }
  }
  return Promise.reject(error);
}
