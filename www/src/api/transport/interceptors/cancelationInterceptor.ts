import createAxiosCancelToken from '../createAxiosCancelToken';
import type { AxiosRequestConfig } from 'axios';

// GET https://webapi.radioedit.iheart.com/graphql [params]
const formLogString = (config: AxiosRequestConfig) => {
  return `${config.method?.toUpperCase()} ${config.url} ${
    config.params && `"${JSON.stringify(config.params)}"`
  }`;
};

const requestCancelationInterceptor =
  (timeout?: number) => (config: AxiosRequestConfig) => {
    // We need to create a new cancel token *per request*. Cancel tokens are instanced
    // eslint-disable-next-line no-param-reassign
    config.cancelToken = createAxiosCancelToken(formLogString(config), timeout);
    return config;
  };

export default requestCancelationInterceptor;
