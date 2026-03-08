import { merge } from 'lodash-es';
import { State } from '../types';

export default function requestingArticle(state: State) {
  return merge({}, state, { status: { requestingArticle: true } });
}
