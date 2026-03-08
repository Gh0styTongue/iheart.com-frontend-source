import axios, { AxiosInstance, AxiosTransformer } from 'axios';
import requestCancelationInterceptor from './interceptors/cancelationInterceptor';
import subscribeInterceptors from './interceptors';
import { getHost } from 'state/Config/selectors';
import { getLocale } from 'state/i18n/selectors';
import { Store } from 'redux';
import { TIMEOUT } from './constants';

const defaultTransformRequest = axios.defaults.transformRequest;

export const createAmpTransport = (getStore: () => Store) => {
  const instance = axios.create({
    timeout: TIMEOUT,

    transformRequest: [
      // we skip the below because the array for of transform request isn't the same in the flow-type file
      (Array.isArray(defaultTransformRequest) ?
        defaultTransformRequest[0]
      : defaultTransformRequest) as AxiosTransformer,
      // WEB-9373 ZS 9/28/17 This is implemented as a transformrequest because
      // hoisting and declaring statically will cause errors related to circular dependencies
      function addAmpHeaders(data, headers = {}) {
        const state = getStore().getState();

        // we modify the headers arg basically because axios makes us
        headers['X-hostName'] = getHost(state); // eslint-disable-line no-param-reassign
        headers['X-Locale'] = getLocale(state); // eslint-disable-line no-param-reassign
        return data;
      },
    ],
  });

  instance.interceptors.request.use(requestCancelationInterceptor());
  instance.interceptors.request.use(
    config => {
      const transformedConfig = { ...config };

      if (config.url?.endsWith('.txt')) {
        transformedConfig.decompress = false;
        transformedConfig.responseType = 'arraybuffer';
        transformedConfig.transformResponse = response => {
          const utf8decoder = new TextDecoder('utf8');
          const latin1decoder = new TextDecoder('latin1');

          let decoded = utf8decoder.decode(response);
          if (decoded.includes('�')) {
            decoded = latin1decoder.decode(response);
          }
          return decoded;
        };
      }

      return transformedConfig;
    },
    error => {
      return Promise.reject(error);
    },
  );

  return instance;
};

export default subscribeInterceptors(createAmpTransport) as (
  a: () => Store,
) => AxiosInstance;
