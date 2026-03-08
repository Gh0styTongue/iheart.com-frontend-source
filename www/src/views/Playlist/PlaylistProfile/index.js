import loadable from '@loadable/component';
import {
  adFreeSelector,
  editPlayableAsRadioSelector,
  getSubscriptionType,
  subInfoLoadedSelector,
} from 'state/Entitlements/selectors';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAllAccessPreviewEnabled,
  getFreeUserMyPlaylistEnabled,
  getFreeUserPlaylistCreationEnabled,
  getPlaylistRadioAdsEnabled,
} from 'state/Features/selectors';
import { getAsyncData, pageInfo } from './statics';
import {
  getCanPlayPremiumPlaylist,
  getCurrentAuthor,
  getCurrentBackfillTrackIds,
  getCurrentBackfillTracks,
  getCurrentCanPlay,
  getCurrentDescription,
  getCurrentImageUrl,
  getCurrentIsCurated,
  getCurrentIsPremiumPlaylist,
  getCurrentName,
  getCurrentOwnerId,
  getCurrentPlaylistId,
  getCurrentPlaylistType,
  getCurrentRequestState,
  getCurrentSeedId,
  getCurrentSlug,
  getCurrentStationType,
  getCurrentTrackIds,
  getCurrentTracks,
  getCurrentTracksDuration,
  getCurrentType,
} from 'state/Playlist/selectors';
import {
  getCountryCode,
  getMediaServerUrl,
  getSiteUrl,
} from 'state/Config/selectors';
import { getPath, getPlaylistInfo } from 'state/Routing/selectors';
import { getProfileId } from 'state/Session/selectors';
import { getStationLoaded } from 'state/Player/selectors';
import { getUpgradeLink } from 'state/Links/selectors';
import { localize } from 'redux-i18n';
import { navigate } from 'state/Routing/actions';
import { requestBackfillTracks, requestTracks } from 'state/Tracks/actions';
import { requestPlaylist, requestUserPlaylists } from 'state/Playlist/actions';

const PlaylistProfile = loadable(() => import('./PlaylistProfile'));

PlaylistProfile.getAsyncData = getAsyncData;
PlaylistProfile.pageInfo = pageInfo;

const mapStateToProps = createStructuredSelector({
  adsFree: adFreeSelector,
  author: getCurrentAuthor,
  backfillTrackIds: getCurrentBackfillTrackIds,
  backfillTracks: getCurrentBackfillTracks,
  canEditPlayableAsRadio: editPlayableAsRadioSelector,
  canPlay: getCurrentCanPlay,
  canPlayPremiumPlaylist: getCanPlayPremiumPlaylist,
  curated: getCurrentIsCurated,
  currentPath: getPath,
  description: getCurrentDescription,
  duration: getCurrentTracksDuration,
  isAllAccessFreePreview: getAllAccessPreviewEnabled,
  isFreeMyPlaylistEnabled: getFreeUserMyPlaylistEnabled,
  isFreeUserPlaylistCreationEnabled: getFreeUserPlaylistCreationEnabled,
  isPremiumPlaylist: getCurrentIsPremiumPlaylist,
  hasUserInfo: subInfoLoadedSelector,
  imgUrl: getCurrentImageUrl,
  mediaServerUrl: getMediaServerUrl,
  name: getCurrentName,
  ownerId: getCurrentOwnerId,
  pathname: getPath,
  playlistAdsEnabled: getPlaylistRadioAdsEnabled,
  playlistId: getCurrentPlaylistId,
  playlistType: getCurrentPlaylistType,
  profileId: getProfileId,
  requestState: getCurrentRequestState,
  seedId: getCurrentSeedId,
  siteUrl: getSiteUrl,
  slug: getCurrentSlug,
  slugIdAndOwner: getPlaylistInfo,
  stationLoaded: getStationLoaded,
  stationType: getCurrentStationType,
  subInfoLoaded: subInfoLoadedSelector,
  subscriptionType: getSubscriptionType,
  trackIds: getCurrentTrackIds,
  tracks: getCurrentTracks,
  type: getCurrentType,
  userCountry: getCountryCode,
  userId: getCurrentOwnerId,
  upgradeLink: getUpgradeLink,
});

export default compose(
  localize('translate'),
  connect(mapStateToProps, {
    navigate,
    requestBackfillTracks,
    requestPlaylist,
    requestTracks,
    requestUserPlaylists,
  }),
)(PlaylistProfile);
