import { Action } from 'state/types';
import { State } from './types';

const constant = 'YOUR_LIBRARY:RESET_NEXT_PAGE_KEY';

function action(): Action<undefined> {
  return {
    type: constant,
  };
}

function reducer(state: State): State {
  return {
    ...state,
    songs: {
      ...state.songs,
      nextPageKey: null,
    },
  };
}

export default {
  action,
  constant,
  reducer,
};
