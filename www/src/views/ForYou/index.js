import getPlaylists from 'state/YourLibrary/getPlaylists';
import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { fetchGenrePreferences } from 'state/Genres/actions';
import { fetchInitialRecs, fetchRecs } from 'state/Recs/actions';
import { getAppsMobileLink } from 'state/Links/selectors';
import { getAsyncData, pageInfo } from './statics';
import { getFavoriteStations } from 'state/Stations/selectors';
import { getForYouRecs, getIsForYouRecsDefault } from 'state/Recs/selectors';
import { getIsAnonymous, getProfileId } from 'state/Session/selectors';
import { getpersonalizedPlaylistRecs } from 'state/Features/selectors';
import { getProcessedRecs } from './selectors';
import { getSelectedGenres } from 'state/Genres/selectors';
import { localize } from 'redux-i18n';
import { requestFollowed } from 'state/Podcast/actions';

const ForYou = loadable(() => import('./ForYou'));

ForYou.getAsyncData = getAsyncData;
ForYou.pageInfo = pageInfo;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      appLink: getAppsMobileLink,
      favoriteStations: getFavoriteStations,
      forYouRecs: getForYouRecs,
      isAnonymous: getIsAnonymous,
      isDefaultRecs: getIsForYouRecsDefault,
      playlists: getPlaylists.selectors.selectPlaylists,
      profileId: getProfileId,
      recs: getProcessedRecs,
      selectedGenres: getSelectedGenres,
      personalizedPlaylistFlag: getpersonalizedPlaylistRecs,
    }),
    {
      fetchGenrePreferences,
      fetchRecs,
      fetchInitialRecs,
      requestFollowedPodcasts: requestFollowed,
    },
  ),
  withAnalytics({ pageName: 'for_you' }),
)(ForYou);
