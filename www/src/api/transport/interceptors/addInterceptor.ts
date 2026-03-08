import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { get, identity } from 'lodash-es';
import { Store } from 'redux';

export default function addInterceptor({
  request = {},
  response = {},
}: {
  request?: {
    failure?: (error: any) => any;
    success?: (
      response: AxiosRequestConfig,
    ) => Promise<AxiosRequestConfig> | AxiosRequestConfig;
  };
  response?: {
    failure?: (error: any) => any;
    success?: <T>(response: AxiosResponse<T>) => any;
  };
}) {
  return function transportFactoryWrapper(
    axiosInstanceCreator: (store: Store) => AxiosInstance,
  ): (store: Store) => AxiosInstance {
    return function transportInstanceFactory(store): AxiosInstance {
      const axiosInstance = axiosInstanceCreator(store);
      axiosInstance.interceptors.request.use(
        get(request, 'success', identity),
        get(request, 'failure', Promise.reject),
      );

      axiosInstance.interceptors.response.use(
        get(response, 'success', identity),
        get(response, 'failure', Promise.reject),
      );

      return axiosInstance;
    };
  };
}
