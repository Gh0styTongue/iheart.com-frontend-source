import safeStringify from 'utils/safeStringify';
import transport from 'api/transport';
import { adsMeta } from 'state/Ads/services';
import { Events as ANALYTIC_EVENTS } from 'modules/Analytics';
import {
  ARTIST_ERROR,
  RECEIVE_AD_GENRE,
  RECEIVE_ARTISTS,
  RECEIVE_PROFILE,
  RECEIVE_SIMILARS,
  REQUEST_ARTIST,
  REQUEST_SIMILARS,
  SET_IS_FAVORITE,
  SIMILARS_ERROR,
} from './constants';
import { CONTEXTS } from 'modules/Logger';
import { createStation } from 'state/Stations/services';
import { E as EVENTS } from 'shared/utils/Hub';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import {
  getArtist,
  getArtistFavorite,
  getArtistName,
  getArtistStationId,
} from './selectors';
import { getArtistByArtistId, getSimilars } from './services';
import { getCredentials, getIsAnonymous } from 'state/Session/selectors';
import { getFollowAnalyticsData } from 'modules/Analytics/legacyHelpers';
import { getGenreRecs } from 'state/Recs/services';
import { getSearch } from 'state/SearchNew/selectors';
import { MOST_POPULAR_ARTISTS_CATEGORY_ID } from 'state/Recs/constants';
import { openSignupModal } from 'state/UI/actions';
import { postIsFavorite } from 'state/Stations/helpers';
import { recsReceived } from 'state/Recs/actions';
import { SET_LAST_PLAYED_DATE } from 'state/Stations/constants';
import { STATION_TYPE } from 'constants/stationTypes';

export function makeArtistRequest() {
  return {
    type: REQUEST_ARTIST,
  };
}

export function artistError(error) {
  return {
    error,
    type: ARTIST_ERROR,
  };
}

export function requestSimilars() {
  return {
    type: REQUEST_SIMILARS,
  };
}

export function similarsError(error) {
  return {
    error,
    type: SIMILARS_ERROR,
  };
}

export function artistReceived(artistData) {
  return {
    payload: { artistData },
    type: RECEIVE_ARTISTS,
  };
}

export function artistProfileReceived(artistData) {
  return {
    payload: artistData,
    type: RECEIVE_PROFILE,
  };
}

export function similarsReceived(id, similars) {
  return {
    payload: {
      artistId: id,
      similars,
    },
    type: RECEIVE_SIMILARS,
  };
}

export function requestArtist(id) {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);
    dispatch(makeArtistRequest());

    return transport(getArtistByArtistId({ ampUrl, artistId: id, countryCode }))
      .then(({ data }) => {
        dispatch(
          artistReceived([
            {
              ...data.artist,
              tracks: data.tracks,
            },
          ]),
        );
      })
      .catch(err => {
        const errObj = new Error(
          `error requesting artist ${safeStringify(err)}`,
        );
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.ARTIST],
          errObj.message,
          {},
          errObj,
        );
        return dispatch(artistError(err));
      });
  };
}

export function receiveArtistAdGenre(artistId, { adswizzGenre }) {
  return {
    payload: {
      adswizzGenre,
      artistId,
    },
    type: RECEIVE_AD_GENRE,
  };
}

export function requestArtistAdGenre(id) {
  return (dispatch, getState) =>
    transport(adsMeta(getAmpUrl(getState()), id)).then(({ data }) => {
      dispatch(receiveArtistAdGenre(id, data));
    });
}

export function getSimilarArtists(id) {
  return (dispatch, getState, { logger }) => {
    const ampUrl = getAmpUrl(getState());
    dispatch(requestSimilars());
    transport(getSimilars({ ampUrl, id }))
      .then(({ data }) => {
        dispatch(similarsReceived(id, data.similarArtists));
      })
      .catch(err => {
        const errObj = err instanceof Error ? err : new Error(err);
        logger.error([CONTEXTS.REDUX, CONTEXTS.ARTIST], err, {}, errObj);
        return dispatch(similarsError(err));
      });
  };
}

export function setIsFavorite({ artistId, isFavorite, artistName, queryId }) {
  return {
    meta: {
      analytics: {
        data: getFollowAnalyticsData({
          followed: isFavorite,
          id: artistId,
          name: artistName,
          prefix: 'artist',
          queryId,
        }),
        event: ANALYTIC_EVENTS.FollowUnfollow,
      },
      deferHub: true,
      hub: [{ event: EVENTS.FAVORITE_CHANGE }],
    },
    payload: { artistId, isFavorite },
    type: SET_IS_FAVORITE,
  };
}

export function toggleFavoriteArtist({ artistId, recentOnly }) {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const isFavorite =
      recentOnly ? false : !getArtistFavorite(state, { artistId });
    const artistName = getArtistName(state, { artistId });
    const stationId = getArtistStationId(state, { artistId });
    const { queryId } = getSearch(state);

    if (getIsAnonymous(state)) {
      return dispatch(openSignupModal({ context: 'artist_favorite' }));
    }

    if (!stationId) {
      return Promise.all([
        transport(
          createStation({
            ampUrl,
            profileId,
            seedId: artistId,
            seedType: STATION_TYPE.ARTIST,
            sessionId,
          }),
          // the createStation call doesn't get us all of the artist's metadata and this call doesn't have the stationId
          // so if we haven't requested the station at all, we do so here and have the create station call
          Object.keys(getArtist(getState(), { artistId })).length ?
            null
          : dispatch(requestArtist(artistId)),
        ),
      ])
        .then(([{ data }]) => {
          dispatch(artistReceived([{ ...data, artistId, stationId: data.id }]));
          postIsFavorite({
            ampUrl,
            artistId,
            isFavorite,
            logger,
            profileId,
            seedType: STATION_TYPE.ARTIST,
            sessionId,
            stationId: artistId,
            transport,
          });
          dispatch(
            setIsFavorite({
              artistId,
              artistName: data.artistName,
              isFavorite,
              queryId,
            }),
          );
        })
        .catch(err => {
          const errObj = err instanceof Error ? err : new Error(err);
          logger.error([CONTEXTS.REDUX, CONTEXTS.ARTIST], err, {}, errObj);
        });
    }

    postIsFavorite({
      ampUrl,
      isFavorite,
      logger,
      profileId,
      seedType: STATION_TYPE.ARTIST,
      sessionId,
      stationId: isFavorite ? artistId : stationId,
      transport,
    });
    return dispatch(
      setIsFavorite({ artistId, artistName, isFavorite, queryId }),
    );
  };
}

export function setArtistLastPlayedDate(seedType, seedId, timestamp) {
  return {
    payload: { seedId, seedType, timestamp },
    type: SET_LAST_PLAYED_DATE,
  };
}

export function getArtists() {
  return async function thunk(dispatch, getState) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { data: artistData } = await transport(
      getGenreRecs({
        ampUrl,
        genreId: MOST_POPULAR_ARTISTS_CATEGORY_ID,
        ops: {
          limit: 40,
          template: 'CR',
        },
      }),
    );

    const { values } = artistData;
    dispatch(
      recsReceived({
        id: MOST_POPULAR_ARTISTS_CATEGORY_ID,
        recs: values,
        type: 'artist',
      }),
    );
  };
}
