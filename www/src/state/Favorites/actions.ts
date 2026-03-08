import transport from 'api/transport';
import { Artist } from 'state/Artists/types';
import { artistReceived } from 'state/Artists/actions';
import { CONTEXTS } from 'modules/Logger';
import { getAmpUrl } from 'state/Config/selectors';
import { getMyFavoritesStation } from './services';
import { getProfileId } from 'state/Session/selectors';
import { mapFavorites } from './helpers';
import { navigate } from 'state/Routing/actions';
import {
  SET_HAS_MFR,
  SET_LISTEN_HISTORY,
  SET_MY_FAVORITE_RADIO,
  SET_MY_FAVORITE_RADIO_NAME,
} from './constants';
import { Thunk } from 'state/types';

export function setMyFavoritesRadio(data: {
  artists: Array<Artist>;
  description: string;
  imagePath: string;
  link: string;
  name: string;
  seedId: number;
  slug: string;
}) {
  return {
    payload: data,
    type: SET_MY_FAVORITE_RADIO,
  };
}

export function setMyFavoritesRadioName(name: string): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      payload: {
        name,
        profileId: getProfileId(getState()),
      },
      type: SET_MY_FAVORITE_RADIO_NAME,
    });
  };
}

export function requestFavorites(
  id: number,
  opts?: {
    bustCache: boolean;
  },
): Thunk<Promise<void>> {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);

    return transport(getMyFavoritesStation(id, ampUrl, opts))
      .then(({ data }) => mapFavorites(data, id))
      .then(radioData => {
        dispatch(artistReceived(radioData.artists));
        dispatch(setMyFavoritesRadio(radioData));
      })
      .catch(e => {
        dispatch(navigate({ path: '/404' }));
        const errObj =
          e instanceof Error ? e : new Error(e.statusText ?? 'error');
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.PLAYBACK, CONTEXTS.MFR],
          errObj.message,
          {},
          errObj,
        );
      });
  };
}

export function setListenHistory(
  userId: number,
  station: { seedId: number; seedType: string; type: string },
) {
  return {
    payload: { station, userId },
    type: SET_LISTEN_HISTORY,
  };
}

export function setHasMFR(doesMeetMFRreq?: boolean) {
  return {
    payload: doesMeetMFRreq,
    type: SET_HAS_MFR,
  };
}
