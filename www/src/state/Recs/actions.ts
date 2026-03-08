import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import {
  FOR_YOU_CATEGORY_ID,
  NO_CUSTOM_TEMPLATE,
  RECEIVE_RECS,
  SET_CAN_LOAD_MORE,
} from './constants';
import { genresRequest } from 'state/Genres/actions';
import { getAmpUrl } from 'state/Config/selectors';
import { getAnonId, getIsLoggedOut, getSession } from 'state/Session/selectors';
import { getCampaignId, getForYouRecs } from './selectors';
import { getCurrentLocation } from 'state/Location/selectors';
import { getCustomRadioEnabled } from 'state/Features/selectors';
import { getGenreRecs, suppressStations } from './services';
import { getGenres } from 'state/Genres/selectors';
import { getLiveStationById } from 'state/Live/services';
import { getMarketOps, parse, parseRecs } from './shims';
import { getRecs } from 'state/Stations/services';
import {
  mapRecStations,
  reduceLiveStationIds,
  reduceRecsToStations,
} from './helpers';
import { openSignupModal } from 'state/UI/actions';
import { ParsedRec, Rec } from './types';
import { receiveStations } from 'state/Stations/actions';
import { Thunk } from 'state/types';

export const setCanLoadMore = (payload: boolean) => ({
  type: SET_CAN_LOAD_MORE,
  payload,
});

export const recsReceived = (payload: {
  defaultRecs?: boolean;
  id: number;
  recs: Array<ParsedRec | Rec>;
  type: string;
}) => ({
  payload,
  type: RECEIVE_RECS,
});

export const requestGenreRecs =
  ({ id }: { id: number }): Thunk<Promise<void>> =>
  (dispatch, getState, { logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const market = getCurrentLocation(state);
    const ops = getMarketOps(market);

    return transport(getGenreRecs({ ampUrl, genreId: id, ops }))
      .then(({ data }) => {
        const recs = parseRecs(data?.values ?? []);
        dispatch(recsReceived({ id, recs, type: 'genre' }));
      })
      .catch(err => {
        logger.error([CONTEXTS.REDUX, CONTEXTS.RECS], err);
      });
  };

export function requestGenresRecs(): Thunk<Promise<void>> {
  return async (dispatch, getState) =>
    dispatch(genresRequest()).then(() => {
      const genres = getGenres(getState());
      return Promise.all(
        Object.keys(genres).map(id =>
          dispatch(requestGenreRecs({ id: Number(id) })),
        ),
      );
    });
}

/**
 * Fetches recs and livestations, does some data mapping, and then sets recs to state
 * Near parallel implementation of the legacy Recs.js _fetch method.
 */
export function fetchRecs(opts?: {
  limit?: number;
  offset?: number;
  merge?: boolean;
}): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const params = {
      limit: 24,
      merge: false,
      offset: 0,
      ...(opts ?? {}),
    };
    const state = getState();

    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getSession(state);

    const { data } = await transport(
      getRecs({
        ampUrl,
        limit: params.limit,
        offset: params.offset,
        profileId,
        sessionId,
        ...(!getCustomRadioEnabled(state) ?
          {
            // tells amp not to send Custom or OD stations, assuming no campaign id is provided
            template: NO_CUSTOM_TEMPLATE,
          }
        : {
            campaignId: getCampaignId(state),
          }),
      }),
    );

    const stations = data?.values ?? [];
    const liveIds = reduceLiveStationIds(stations);

    const { data: liveStations } = await transport(
      getLiveStationById({
        ampUrl,
        id: liveIds,
      }),
    );

    const hits = liveStations?.hits ?? [];
    const parsedRecs = parse(mapRecStations(stations, hits));

    dispatch(receiveStations(reduceRecsToStations(parsedRecs)));

    const finalRecs =
      params.merge ? [...getForYouRecs(state), ...parsedRecs] : parsedRecs;
    dispatch(setCanLoadMore(finalRecs.length === params.limit));

    return dispatch(
      recsReceived({
        defaultRecs: !!getAnonId(state),
        id: FOR_YOU_CATEGORY_ID,
        recs: finalRecs,
        type: 'for-you',
      }),
    );
  };
}

export function fetchInitialRecs(): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const initialRecs = getForYouRecs(getState());

    return initialRecs.length ? Promise.resolve() : dispatch(fetchRecs());
  };
}

export function deleteRecByTypeAndId(
  type: string,
  id: string | number,
  dlType?: string,
): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();
    const recs = getForYouRecs(state);
    const { sessionId, profileId } = getSession(state);
    const isLoggedOut = getIsLoggedOut(state);
    const ampUrl = getAmpUrl(state);

    if (isLoggedOut || !(sessionId && profileId)) {
      dispatch(openSignupModal({}));
      return;
    }

    let stationIndex: number;
    let station:
      | {
          id: number;
          type: string;
          dlType?: string;
        }
      | undefined;

    recs.forEach((s: any, i: number) => {
      if (s.content.seedType === type && s.content.seedId === id) {
        let contentId;

        if (dlType) {
          // reportingKey will be added to AMP in the future, and this fallback will not be needed
          contentId =
            s.content.reportingKey ?
              s.content.reportingKey
            : `${s.content.ownerId}::${s.content.id}`;
        } else {
          contentId = s.content.id;
        }

        stationIndex = i;
        station = {
          id: contentId,
          type: s.type,
        };
        if (dlType) station.dlType = dlType;
      }
    });

    if (!station) {
      return;
    }

    await transport(
      suppressStations({
        ampUrl,
        profileId,
        sessionId,
        station,
      }),
    );

    await dispatch(
      recsReceived({
        defaultRecs: false,
        id: FOR_YOU_CATEGORY_ID,
        recs: recs.filter(
          (rec: unknown, index: number) => index !== stationIndex,
        ),
        type: 'for-you',
      }),
    );
  };
}
