import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getCurrentCoordinates,
  getCurrentCountry,
  getCurrentZip,
  getDefaultMarket,
  getDefaultMarketId,
} from './selectors';
import { getMarketByIdQuery, getMarketByLocationQuery } from './services';
import {
  RECEIVE_CURRENT_LOCATION,
  RECEIVE_CURRENT_MARKET,
  RECEIVE_DEFAULT_MARKET,
  REJECT_CURRENT_MARKET,
  REJECT_DEFAULT_MARKET,
} from './constants';

export function receiveCurrentLocation(location) {
  return {
    meta: {
      analytics: {
        data: {
          device: {
            lat: Number.parseFloat(location.latitude),
            lng: Number.parseFloat(location.longitude),
          },
        },
      },
    },
    payload: location,
    type: RECEIVE_CURRENT_LOCATION,
  };
}

export function receiveDefaultMarket(market) {
  return {
    payload: market,
    type: RECEIVE_DEFAULT_MARKET,
  };
}

export function rejectDefaultMarket(error) {
  return {
    error,
    type: REJECT_DEFAULT_MARKET,
  };
}

export function requestDefaultMarket() {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    return transport(
      getMarketByIdQuery({
        ampUrl: getAmpUrl(state),
        id: getDefaultMarketId(state),
      }),
    )
      .then(({ data: market }) => dispatch(receiveDefaultMarket(market)))
      .catch(message => {
        const errObj = new Error(message);
        logger.error(CONTEXTS.LOCATION, message, {}, errObj);
        return dispatch(rejectDefaultMarket(errObj));
      });
  };
}

export function receiveCurrentMarket(market) {
  return {
    payload: market,
    type: RECEIVE_CURRENT_MARKET,
  };
}

export function rejectCurrentMarket(error) {
  return {
    error,
    type: REJECT_CURRENT_MARKET,
  };
}

export function requestCurrentMarket() {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    const { latitude, longitude } = getCurrentCoordinates(state) || {};
    const zip = getCurrentZip(state);
    const country = getCurrentCountry(state);
    const canQueryMarket = (latitude && longitude) || zip;

    return (
      canQueryMarket ?
        transport(
          getMarketByLocationQuery(
            { ampUrl: getAmpUrl(state) },
            {
              country,
              ...(latitude && longitude ? { latitude, longitude } : { zip }),
            },
          ),
        )
      : Promise.resolve().then(() => {
          throw new Error("can't query market!  No location data!");
        }))
      .then(res => {
        const markets = res.data.hits;
        if (!markets || !markets.length) {
          throw new Error(
            'Unable to find market by location!  No results returned!',
          );
        }

        return markets[0].stateName.trim() === 'International' ?
            dispatch(requestDefaultMarket())
          : dispatch(receiveCurrentMarket(markets[0]));
      })
      .catch(message => {
        const errObj = new Error(message);
        logger.error([CONTEXTS.REDUX, CONTEXTS.LOCATION], message, {}, errObj);
        dispatch(rejectCurrentMarket(errObj));
        const defaultMaket = getDefaultMarket(getState());
        if (!defaultMaket) {
          dispatch(requestDefaultMarket());
        }
      });
  };
}
