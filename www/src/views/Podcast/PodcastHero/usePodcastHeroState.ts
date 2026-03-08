import { createStructuredSelector } from 'reselect';
import {
  getDescription,
  getImgUrl,
  getIsFollowed,
  getPodcastPath,
  getSeedId,
  getSeedType,
  getTitle,
} from 'state/Podcast/selectors';
import { getIsLoggedOut } from 'state/Session/selectors';
import { getMediaServerUrl, getStationSoftgate } from 'state/Config/selectors';
import { useSelector } from 'react-redux';
import type { State as ReduxState } from 'state/types';
import type { StationSoftgate } from 'state/Config/types';

type State = {
  description: string;
  followed: boolean;
  isLoggedOut: boolean;
  imgUrl?: string;
  mediaServerUrl: string;
  pathname: string | null;
  seedId: number;
  seedType: string;
  stationSoftgate: StationSoftgate;
  title: string;
};

const selector = createStructuredSelector<ReduxState, State>({
  description: getDescription,
  followed: getIsFollowed,
  isLoggedOut: getIsLoggedOut,
  imgUrl: getImgUrl,
  mediaServerUrl: getMediaServerUrl,
  pathname: getPodcastPath,
  seedId: getSeedId,
  seedType: getSeedType,
  stationSoftgate: getStationSoftgate,
  title: getTitle,
});

function usePodcastHeroReduxState(): State {
  return useSelector<ReduxState, State>(selector);
}

export default usePodcastHeroReduxState;
