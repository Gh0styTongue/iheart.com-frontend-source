import getPlayback from './getPlayback';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';

const getVolume = createSelector(getPlayback, state => get(state, 'volume'));

export default getVolume;
