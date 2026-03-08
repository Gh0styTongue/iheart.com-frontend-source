import factory from 'state/factory';
import { E } from 'shared/utils/Hub';
import { getHistory } from 'state/Routing/selectors';
import {
  LOCATION_CHANGE,
  NAVIGATE,
  RESET_SERVER_ERRORS,
  SET_FORCE_404_DATA,
  SET_PAGE_INFO,
  SET_SERVER_ERROR,
} from './constants';

const store = factory();

// react-router-redux 4 doesn't support router 4. Work on ver 5 has started
// and it's on alpha stage. This should be refactored once they passed alpha
// WEB-8214 we do default arguments to allow partial passing of arguments without breaking
// the reducer
export function changeLocation({ history = {}, location = {}, match = {} }) {
  return {
    payload: {
      history,
      location,
      params: match.params,
    },
    type: LOCATION_CHANGE,
  };
}

export function setPageInfo(pageInfo = {}) {
  return {
    payload: pageInfo,
    type: SET_PAGE_INFO,
  };
}

export function navigate({ path, replace = false }) {
  // pushing to history is done here because it may cause actions to be fired and so can't be called in the reducer
  const history = getHistory(store.getState());
  const { pathname } = window.location;

  if (path === '/404') {
    history.push(pathname);

    return {
      payload: {
        code: 404,
      },
      type: SET_SERVER_ERROR,
    };
  }

  if (path === '/500') {
    history.push(pathname);

    return {
      payload: {
        code: 500,
      },
      type: SET_SERVER_ERROR,
    };
  }

  if (replace) {
    history.replace?.(path);
  } else {
    history.push?.(path);
  }

  return {
    meta: {
      hub: [
        {
          args: [path],
          event: E.NAVIGATE,
        },
      ],
    },
    payload: { path },
    type: NAVIGATE,
  };
}

export function resetServerErrors() {
  return { type: RESET_SERVER_ERRORS };
}

export function setServerError({ code = 500, statusText = '' }) {
  return {
    payload: {
      code,
      statusText,
    },
    type: SET_SERVER_ERROR,
  };
}

export function setForce404data(force404data) {
  return {
    payload: { force404data },
    type: SET_FORCE_404_DATA,
  };
}

export function replaceHistoryState(path) {
  return {
    meta: {
      hub: [
        {
          args: [path],
          event: E.NAVIGATE,
        },
      ],
    },
    payload: { location: { pathname: path } },
    type: NAVIGATE,
  };
}
