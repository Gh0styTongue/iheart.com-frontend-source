import cookie from 'js-cookie';
import whenPopulated from 'utils/whenPopulated';
import { GEO_COUNTRY, GEO_LAT, GEO_LONG, GEO_ZIP } from './constants';
import { getCurrentLocation, getCurrentMarket } from './selectors';
import { receiveCurrentLocation, requestCurrentMarket } from './actions';

export function extractLocationFromCookie() {
  const zipCookie = cookie.get(GEO_ZIP);
  return {
    country: cookie.get(GEO_COUNTRY),
    latitude: cookie.get(GEO_LAT),
    longitude: cookie.get(GEO_LONG),
    zip: !zipCookie || zipCookie === '(null)' ? null : zipCookie,
  };
}

export function requestCurrentLocationAndMarket(store) {
  if (__CLIENT__) {
    store.dispatch(receiveCurrentLocation(extractLocationFromCookie()));
    whenPopulated(store, getCurrentLocation).then(() =>
      store.dispatch(requestCurrentMarket()),
    );
  } else {
    store.dispatch(requestCurrentMarket());
  }
  return whenPopulated(store, getCurrentMarket);
}
