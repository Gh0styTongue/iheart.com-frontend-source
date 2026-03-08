import axios, { AxiosInstance } from 'axios';
import requestCancelationInterceptor from './interceptors/cancelationInterceptor';
import subscribeInterceptors from './interceptors';
import { Store } from 'redux';
import { TIMEOUT } from './constants';

const createTransport = () => {
  const instance = axios.create({
    timeout: TIMEOUT,
  });

  instance.interceptors.request.use(requestCancelationInterceptor());

  return instance;
};

// note change in call signature to require a store factory to be passed in
export default subscribeInterceptors(createTransport) as (
  a: () => Store,
) => AxiosInstance;
