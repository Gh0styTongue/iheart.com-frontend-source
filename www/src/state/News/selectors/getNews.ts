import { get } from 'lodash-es';
import { State } from 'state/types';

export function getNews(state: State) {
  return get(state, 'news');
}

export default getNews;
