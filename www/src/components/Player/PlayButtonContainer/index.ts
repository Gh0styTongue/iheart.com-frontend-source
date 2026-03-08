import PlayButtonContainer, { Props } from './PlayButtonContainer';
import withAdsPlayer from 'ads/playback/shims/withAdsPlayer';
import withAdsPlayerState from 'ads/playback/shims/withAdsPlayerState';
import {
  artistToStartSelector,
  getEntitlements,
  getIsTrialEligible,
  getSubscriptionType,
  playAlbumSelector,
  playPlaylistOnDemandSelector,
  playPlaylistRadioSelector,
  songToStartSelector,
  unlimitedMyMusicPlaybackSelector,
} from 'state/Entitlements/selectors';
import { ComponentType } from 'react';
import { connect, MapStateToPropsParam } from 'react-redux';
import { createStructuredSelector, Selector } from 'reselect';
import { encodePlaylistSeedId, isPlaylist } from 'state/Playlist/helpers';
import { Entitlements } from 'state/Entitlements/types';
import { flowRight } from 'lodash-es';
import { getAllAccessPreviewEnabled } from 'state/Features/selectors';
import {
  getCurrentAlbumId,
  getCurrentAlbumTitle,
} from 'state/Albums/selectors';
import {
  getIsCurated,
  getStationType as getPlaylistStationType,
} from 'state/Playlist/selectors';
import { getMuted } from 'state/Playback/selectors';
import { getProfileId } from 'state/Session/selectors';
import { getStation } from 'state/Stations/selectors';
import { PlaybackTypeValue } from 'constants/stationTypes';
import { State } from 'state/buildInitialState';
import { Thunk } from 'state/types';
import { toggleMute } from 'state/Playback/actions';

type Selectors = {
  allAccessPreview: boolean;
  canPlayAlbum: boolean;
  canPlayMyMusic: boolean;
  canPlayPlaylist: boolean;
  canPlayPlaylistRadio: boolean;
  canStartArtistRadio: boolean;
  canStartSongRadio: boolean;
  curated: boolean;
  currentAlbumTitle: string;
  currentAlbumId: string | number;
  entitlements: Entitlements;
  isMuted: boolean;
  isTrialEligible: boolean;
  profileId: number | null;
  stationId: any;
  stationType: PlaybackTypeValue;
  station: any;
  subscriptionType: string;
};

const stationId = (
  state: State,
  { stationType, seedId, stationId: id, playlistUserId, playlistId }: Props,
) => {
  if (!isPlaylist(stationType)) return id;
  return encodePlaylistSeedId(playlistUserId, playlistId) || seedId;
};

const stationType = (
  state: State,
  { playlistUserId, playlistId, stationType: type }: Props,
) => {
  if (!isPlaylist(type)) return type;
  return getPlaylistStationType(state, {
    playlistId,
    playlistUserId,
  });
};

const station = (state: State, props: Props) => {
  const type = stationType(state, props);
  const id = stationId(state, props);
  return getStation(state, { id, type }) ?? {};
};

const mapStateToProps: MapStateToPropsParam<
  Selectors,
  Pick<Props, Exclude<keyof Props, Selectors>>,
  State
> = createStructuredSelector<
  State,
  { playlistId?: string; playlistUserId?: string; seedId?: string | number },
  Selectors
>({
  allAccessPreview: getAllAccessPreviewEnabled,
  canPlayAlbum: playAlbumSelector,
  canPlayMyMusic: unlimitedMyMusicPlaybackSelector,
  canPlayPlaylist: playPlaylistOnDemandSelector,
  canPlayPlaylistRadio: playPlaylistRadioSelector,
  canStartArtistRadio: artistToStartSelector,
  canStartSongRadio: songToStartSelector,
  curated: getIsCurated,
  currentAlbumId: getCurrentAlbumId,
  currentAlbumTitle: getCurrentAlbumTitle,
  entitlements: getEntitlements,
  isMuted: getMuted,
  isTrialEligible: getIsTrialEligible,
  profileId: getProfileId,
  stationId: stationId as Selector<State, any>,
  stationType: stationType as Selector<State, PlaybackTypeValue>,
  station: station as Selector<State, any>,
  subscriptionType: getSubscriptionType,
});

export default flowRight(
  withAdsPlayer,
  withAdsPlayerState,
  connect<
    Selectors,
    { toggleMute: () => Thunk<void> },
    Pick<Props, Exclude<keyof Props, Selectors>>,
    State
  >(mapStateToProps, { toggleMute }),
)(PlayButtonContainer) as ComponentType<Omit<Props, 'adsPlayerState'>>;
