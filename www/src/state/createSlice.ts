import createAction from './createAction';
import createReducer from './createReducer';
import type { State } from './types';

type Reducers<S, R> = {
  [key in keyof R]: (state: S, payload: any) => Partial<S>;
};

type Actions<S, R extends Reducers<S, R>> = {
  [key in keyof R]: (
    payload: Parameters<R[key]>[1] extends undefined ? void
    : Parameters<R[key]>[1],
  ) => {
    type: string;
    payload: typeof payload;
  };
};

/**
 * Internal helper to convert unformatted action types to a constant case format
 */
function toType(str: `${string}/${string}`) {
  const regex = /[A-Z]+/g;
  // Prefixes matched uppercase letters with an underscore
  // so foo/setBarAB becomes foo/set_Bar_AB
  const replaced = str.replace(regex, '_$&');
  // Turns foo/set_Bar_AB to FOO/SET_BAR_AB
  return replaced.toUpperCase();
}

/**
 * Generates a reducer, selector, and actions for a slice of state.
 */
function createSlice<S, R extends Reducers<S, R>, RootState = State>({
  path,
  reducers: reducerConfig,
  initialState,
}: {
  /**
   * The property of the global state object this slice represents
   */
  path: keyof RootState;
  /**
   * A map of reducer functions which only need to return partial state.
   * They generate actions which share the same name
   */
  reducers: R;
  /**
   * The initialState for this slice (which should use the same type signature as the slice state)
   */
  initialState: S;
}) {
  const actions: Partial<Actions<S, R>> = {};
  const reducers: Record<string, (state: S, payload: any) => S> = {};

  Object.keys(reducerConfig).forEach((actionName: string) => {
    const reducer = reducerConfig[actionName as keyof R];
    const prefixedName = toType(
      `${String(path)}/${actionName}` as `${string}/${string}`,
    );

    actions[actionName as keyof R] = createAction(prefixedName);
    reducers[prefixedName] = (state: S, payload: any): S => ({
      ...state,
      ...reducer(state, payload),
    });
  });

  return {
    /**
     * Generated actions from the reducer definitions
     */
    actions: actions as Actions<S, R>,
    /**
     * The reducer to pass to `combineReducers`
     */
    reducer: createReducer<S>(initialState, reducers),
    /**
     * The root level selector for this slice of state
     */
    selector: (state: RootState) => (state?.[path] ?? initialState) as S,
  };
}

export default createSlice;
