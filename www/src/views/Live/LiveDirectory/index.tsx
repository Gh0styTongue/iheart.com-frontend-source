import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { Country, Genre, LiveStation } from 'state/Live/types';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAmpUrl } from 'state/Config/selectors';
import { getAsyncData, pageInfo } from './statics';
import {
  getCountryOptions,
  getCurrentlySelectedCountry,
  getGenreFilter,
  getGenreOptions,
  getMarketFilter,
  getMarketOptions,
  getStationsForCurrentFilters,
} from 'state/Live/selectors';
import { getCurrentMarket } from 'state/Location/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import { localize } from 'redux-i18n';
import { Location, Market } from 'state/Location/types';
import { replaceHistoryState } from 'state/Routing/actions';
import {
  setCountryOptions,
  setNewCountry,
  setNewGenre,
  setNewMarket,
} from 'state/Live/actions';
import { setHasHero } from 'state/Hero/actions';
import { State } from 'state/types';
import { supportsSocialConnect } from 'state/SiteData/selectors';
import { ViewWithStatics } from 'views/ViewWithStatics';

const LiveDirectory = loadable(
  () => import('./LiveDirectory'),
) as ViewWithStatics;

LiveDirectory.getAsyncData = getAsyncData;
LiveDirectory.pageInfo = pageInfo;

export const getAnalyticsData = ({
  currentCountry,
  currentGenre,
  currentMarket,
}: {
  currentCountry: Country;
  currentGenre: Genre;
  currentMarket: Market;
}) => {
  const country = currentCountry && currentCountry.abbreviation;
  const market = currentMarket || {};
  const { city, stateAbbreviation: state } = market;
  const filterName = currentGenre ? currentGenre.name : undefined;
  const filterType = filterName ? 'Genre' : undefined;
  const filterLocation = [city, state, country].join(', ');
  const pageName = `live_radio_${country ? 'sub_' : ''}directory`;

  return {
    filterLocation,
    filterName,
    filterType,
    pageName,
  };
};

const trackOnDidUpdate = (
  { currentMarket: prevMarket = {}, currentGenre: prevGenre = {} } = {} as any,
  { currentMarket: nextMarket = {}, currentGenre: nextGenre = {} } = {} as any,
) => {
  const marketChanged =
    (nextMarket && nextMarket.countryId) !==
      (prevMarket && prevMarket.countryId) ||
    (nextMarket && nextMarket.marketId) !== (prevMarket && prevMarket.marketId);
  const genreChanged =
    (nextGenre && nextGenre.id) !== (prevGenre && prevGenre.id);

  return marketChanged || genreChanged;
};

export default flowRight(
  localize('translate'),
  connect(
    createStructuredSelector<
      State,
      {
        ampUrl: string;
        countryOptions: Array<Location>;
        currentCountry: Country | null;
        currentGenre: Genre | null;
        currentMarket: Market | null;
        currentPath: string;
        genreOptions: Array<Genre>;
        geoMarket: Market;
        marketOptions: Array<Market>;
        stations: Array<LiveStation> | null;
        supportsSocialConnect: boolean;
      }
    >({
      ampUrl: getAmpUrl,
      countryOptions: getCountryOptions,
      currentCountry: getCurrentlySelectedCountry,
      currentGenre: getGenreFilter,
      currentMarket: getMarketFilter,
      currentPath: getCurrentPath,
      genreOptions: getGenreOptions,
      geoMarket: getCurrentMarket,
      marketOptions: getMarketOptions,
      stations: getStationsForCurrentFilters,
      supportsSocialConnect,
    }),
    {
      replaceHistoryState,
      setCountry: setNewCountry,
      setCountryOptions,
      setGenre: setNewGenre,
      setHasHero,
      setMarket: setNewMarket,
    },
  ),
  withAnalytics(getAnalyticsData, { trackOnDidUpdate }),
)(LiveDirectory);
