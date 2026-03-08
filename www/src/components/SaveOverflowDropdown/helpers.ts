import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import type { PlayedFrom } from 'modules/Analytics/types';

export function isSearchPlayedFrom(playedFrom: PlayedFrom) {
  switch (playedFrom) {
    case PLAYED_FROM.SEARCH_RESULTS_FILTERED:
    case PLAYED_FROM.SEARCH_RESULTS_MAIN:
    case PLAYED_FROM.SEARCH_RESULTS_MAIN_TOP_HIT:
    case PLAYED_FROM.SEARCH_RESULTS_MAIN_NOW_PLAYING:
      return true;
    default:
      return false;
  }
}
