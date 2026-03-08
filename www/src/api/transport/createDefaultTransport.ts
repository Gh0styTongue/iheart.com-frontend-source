import axios, { AxiosTransformer } from 'axios';
import factory from 'state/factory';
import requestCancelationInterceptor from './interceptors/cancelationInterceptor';
import subscribeInterceptors from './interceptors';
import { getHost } from 'state/Config/selectors';
import { getLang, getLocale } from 'state/i18n/selectors';
import { TIMEOUT } from './constants';

const defaultTransformRequest = axios.defaults.transformRequest;

const createDefaultTransport = () => {
  const instance = axios.create({
    timeout: TIMEOUT,
    transformRequest: [
      // we skip the below because the array for of transform request isn't the same in the flow-type file
      Array.isArray(defaultTransformRequest) ?
        defaultTransformRequest[0]
      : (defaultTransformRequest as AxiosTransformer),
      // WEB-9373 ZS 9/28/17 This is implemented as a transformrequest because
      // hoisting and declaring statically will cause errors related to circular dependencies
      function addAmpHeaders(data, headers = {}) {
        const state = factory().getState();

        // we modify the headers arg basically because axios makes us
        headers['X-hostName'] = getHost(state); // eslint-disable-line no-param-reassign
        headers['X-Locale'] = getLocale(state); // eslint-disable-line no-param-reassign
        headers['Accept-Language'] = getLang(state); // eslint-disable-line no-param-reassign
        return data;
      },
    ],
  });

  instance.interceptors.request.use(requestCancelationInterceptor());

  return instance;
};

export default subscribeInterceptors(createDefaultTransport)(factory);
