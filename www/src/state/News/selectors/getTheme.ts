import getTags from './getTags';
import { createSelector } from 'reselect';

const getTheme = createSelector(getTags, tags => {
  const firstTheme =
    (tags as [string]).find(tag => tag.startsWith('collections/')) || '';

  return firstTheme
    .replace('collections/', '')
    .split('-')
    .map((word: string) =>
      word ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join('-');
});

export default getTheme;
