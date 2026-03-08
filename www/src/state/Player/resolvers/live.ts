import whenPopulated from 'utils/whenPopulated';
import { createStation } from 'state/Stations/actions';
import { createStructuredSelector } from 'reselect';
import { get } from 'lodash-es';
import { getIsAnonymous } from 'state/Session/selectors';
import { getLiveStation } from 'state/Live/selectors';
import { getProfileReceived } from 'state/Profile/selectors';
import { requestSingleStation } from 'state/Live/actions';
import type { LiveStation } from 'state/Live/types';
import type { State, Store } from 'state/types';
import type { StationTypeValue } from 'constants/stationTypes';

const profileSelector = createStructuredSelector<
  State,
  { isAnonymous: boolean; profileReceived: boolean }
>({
  isAnonymous: getIsAnonymous,
  profileReceived: getProfileReceived,
});

export function liveResolver({
  partialLoad,
  stationId,
  store,
  playedFrom,
  stationType,
}: {
  partialLoad: boolean;
  playedFrom: string;
  stationId: string | number;
  stationType: StationTypeValue;
  store: Store;
}): Promise<LiveStation> {
  const station = getLiveStation(store.getState(), { stationId });
  const canInitializeStationPromise = Promise.all([
    /**
     * If we are just loading the station into the player (partialLoad), we do
     * not need to make the call to retrieve the streaming data; otherwise, we
     * hit amp and they record the station as being listened to and it is saved
     * to the user's listening history.
     */
    get(station, 'lastPlayedDate') || partialLoad ?
      Promise.resolve()
    : (store.dispatch(
        createStation(stationType, stationId, playedFrom),
      ) as Promise<unknown>),
    whenPopulated<ReturnType<typeof profileSelector>>(
      store,
      profileSelector,
      ({ isAnonymous, profileReceived }) => isAnonymous || profileReceived,
    ),
  ]);
  if (!station || !Object.keys(station).length || !station.resolved) {
    return canInitializeStationPromise.then(() =>
      store.dispatch(requestSingleStation(String(stationId))).then(() => ({
        retryCount: 0,
        trackIndex: 0,
        ...getLiveStation(store.getState(), {
          stationId,
        }),
      })),
    );
  }

  return canInitializeStationPromise.then(() => ({
    retryCount: 0,
    trackIndex: 0,
    ...station,
  }));
}
