import getKeywords from './getKeywords';
import { createSelector } from 'reselect';

const getArtistId = createSelector(getKeywords, topics => {
  const split = topics.find(topic => topic.startsWith('artists/'));

  if (split) {
    const arr = split.split('(');
    return arr[arr.length - 1].slice(0, -1);
  }

  return split;
});

export default getArtistId;
