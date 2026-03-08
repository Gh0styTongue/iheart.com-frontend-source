import getUser, { getAbTests } from 'state/User/selectors';
import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAmpUrl } from 'state/Config/selectors';
import { getAsyncData, pageInfo } from './statics';
import { getContentLink } from 'state/Links/selectors';
import {
  getCurrentPodcastArticles,
  getCurrentPodcastEpisode,
  getDescription,
  getImgUrl,
  getPodcastAdTargeting,
  getPodcastHosts,
  getPodcastPath,
  getSeedId,
  getSeedType,
  getShowType,
  getSlug,
  getTitle,
} from 'state/Podcast/selectors';
import { getParams } from 'state/Routing/selectors';
import { getProfileId, getSessionId } from 'state/Session/selectors';
import { Props } from './PodcastProfile';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';
import { withRouter } from 'react-router-dom';

const PodcastProfile = loadable(
  () => import('./PodcastProfile'),
) as ViewWithStatics;

PodcastProfile.getAsyncData = getAsyncData;
PodcastProfile.pageInfo = pageInfo;

export default flowRight(
  connect(
    createStructuredSelector<
      State,
      Pick<
        Props,
        | 'abTestGroups'
        | 'adTargeting'
        | 'ampUrl'
        | 'articles'
        | 'contentLink'
        | 'description'
        | 'episode'
        | 'hosts'
        | 'imgUrl'
        | 'pathname'
        | 'profileId'
        | 'routeParams'
        | 'seedId'
        | 'seedType'
        | 'sessionId'
        | 'showType'
        | 'slug'
        | 'title'
        | 'user'
      >
    >({
      abTestGroups: getAbTests,
      adTargeting: getPodcastAdTargeting,
      ampUrl: getAmpUrl,
      articles: getCurrentPodcastArticles,
      contentLink: getContentLink,
      description: getDescription,
      episode: getCurrentPodcastEpisode,
      hosts: getPodcastHosts,
      imgUrl: getImgUrl,
      pathname: getPodcastPath,
      profileId: getProfileId,
      routeParams: getParams,
      seedId: getSeedId,
      seedType: getSeedType,
      sessionId: getSessionId,
      showType: getShowType,
      slug: getSlug,
      title: getTitle,
      user: getUser,
    }),
  ),
  withRouter,
)(PodcastProfile);
