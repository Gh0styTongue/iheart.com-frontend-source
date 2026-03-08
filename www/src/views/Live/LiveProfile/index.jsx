import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAbTests } from 'state/User/selectors';
import {
  getAds,
  getCallLetters,
  getCurrentStation,
  getGenreNames,
  getHasLocalSocial,
  getLiveStationPath,
  getSeedId,
  getStationSite,
} from 'state/Live/selectors';
import { getAsyncData, pageInfo } from './statics';
import { getParams, getQueryParams } from 'state/Routing/selectors';
import { getStationLoaded } from 'state/Player/selectors';

const LiveProfile = loadable(() => import('./LiveProfile'));

LiveProfile.getAsyncData = getAsyncData;
LiveProfile.pageInfo = pageInfo;

export default connect(
  createStructuredSelector({
    ads: getAds,
    abTestGroups: getAbTests,
    callLetters: getCallLetters,
    currentStation: getCurrentStation,
    hasLocalSocial: getHasLocalSocial,
    pagePath: getLiveStationPath,
    queryParam: getQueryParams,
    routeParams: getParams,
    seedId: getSeedId,
    stationLoaded: getStationLoaded,
    stationSite: getStationSite,
    genres: getGenreNames,
  }),
)(LiveProfile);
