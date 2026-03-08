import Events from 'modules/Analytics/constants/events';
import { CONTEXTS } from 'modules/Logger';
import { E } from 'shared/utils/Hub';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getFollowAnalyticsData } from 'modules/Analytics/legacyHelpers';
import { removeFavorite } from 'state/Stations/services';
import type { SavedStation, State } from './types';
import type { Thunk } from 'state/types';

const constant = 'YOUR_LIBRARY:REMOVE_SAVED_STATION';

function action(id: SavedStation['id']): Thunk<Promise<void>> {
  return async function thunk(
    dispatch,
    getState,
    { logger, transport },
  ): Promise<void> {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const { name, seedType, stationId } =
      state?.yourLibrary?.savedStations?.info?.[id] ?? {};
    try {
      await transport(
        removeFavorite({ profileId, sessionId, stationId, ampUrl, seedType }),
      );
      dispatch({
        meta: {
          analytics: {
            data: getFollowAnalyticsData({
              followed: false,
              id,
              name,
              prefix: seedType,
            }),
            event: Events.FollowUnfollow,
          },
          deferHub: true,
          hub: [{ event: E.FAVORITE_CHANGE }],
        },
        payload: id,
        type: constant,
      });
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}

function reducer(state: State, incomingId: string): State {
  const { order: existingOrder } = state.savedStations;
  const order = existingOrder.filter(id => String(id) !== String(incomingId));
  return { ...state, savedStations: { ...state.savedStations, order } };
}

export default {
  action,
  constant,
  reducer,
};
