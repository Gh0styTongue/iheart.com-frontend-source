/* eslint-disable import/no-mutable-exports */

import addInterceptor from './addInterceptor';
import makeUnauthorizedInterceptor from './unauthorizedInterceptor';
import { AxiosInstance } from 'axios';
import { curry, flow } from 'lodash-es';
import { logResponseFailure, logResponseSuccess } from './loggingInterceptors';
import { Store } from 'redux';

type TransportCreator = (getStore: () => Store) => AxiosInstance;

let subscribeInterceptors: (
  transportCreator: TransportCreator,
) => TransportCreator;

if (__CLIENT__) {
  subscribeInterceptors = curry((transportCreator: any, getStore: any) => {
    const wrappingFunction = flow(
      addInterceptor({
        response: {
          failure: logResponseFailure,
          success: logResponseSuccess,
        },
      }),
      addInterceptor({
        response: {
          failure: makeUnauthorizedInterceptor(getStore),
        },
      }),
    );
    return wrappingFunction(transportCreator)(getStore);
  });
} else {
  subscribeInterceptors = curry((transportCreator: any, getStore: any) => {
    const wrappingFunction = flow(
      addInterceptor({
        response: {
          failure: logResponseFailure,
          success: logResponseSuccess,
        },
      }),
    );
    return wrappingFunction(transportCreator)(getStore);
  });
}

export default subscribeInterceptors;
