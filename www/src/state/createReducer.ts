import { Action, Reducer } from 'state/types';

export type Config<S> = {
  [key: string]: (state: S, payload?: any) => S;
};

export default function createReducer<S>(
  initialState: S,
  config: Config<S> = {},
): Reducer<S, Action<any>> {
  return function reducer(
    state: S = initialState,
    { payload, type }: Action<any>,
  ): S {
    if (Object.prototype.hasOwnProperty.call(config, type)) {
      return config[type](state, payload);
    }
    return state;
  };
}
