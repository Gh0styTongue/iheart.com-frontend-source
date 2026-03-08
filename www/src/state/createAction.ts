/**
 * Given an action type (eg: IHR/SET_COUNTER), returns an action creator
 */
function createAction<T>(type: string) {
  return (payload: T) => ({
    type,
    payload,
  });
}

export default createAction;
