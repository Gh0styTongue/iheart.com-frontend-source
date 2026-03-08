import { createSelector } from 'reselect';
import { getStationLogoById } from 'state/Live/selectors';
import { STATION_TYPE } from 'constants/stationTypes';

// AV - 3/13/18 - WEB-11013
// TODO: https://jira.ihrint.com/browse/WEB-10764
// our long term goal is to be able to continue only needing stationType and stationId to get images, but not need to build urls
// this is especially a problem for live since built urls don't work in non-US envs.  This selector starts us in that direction,

const getStationLogoByIdIfLive = createSelector(
  (state, { type, id }) =>
    type === STATION_TYPE.LIVE ?
      getStationLogoById(state, { stationId: id })
    : '',
  (_, { src }) => src,
  (logo, src) => src || logo,
);

export { getStationLogoByIdIfLive };
