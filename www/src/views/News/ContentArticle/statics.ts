import getArticle from 'state/News/actions/getArticle';
import getRadioEditRedirect from 'router/getRadioEditRedirect';
import { articlesLoaded } from 'state/News/actions';
import { CONTEXTS } from 'modules/Logger';
import {
  getAdKeywords,
  getAdTopics,
  getArtistId,
  getCUser,
  getEyesToEarsBlocks,
  getFeedVendor,
  getGalleryBlocks,
  getPublishDate,
  getResourceId,
  getSeoTitle,
  getTheme,
} from 'state/News/selectors';
import {
  getCurrentPath,
  getQueryParams,
  getSlug,
} from 'state/Routing/selectors';
import { getSiteUrl, getWebGraphQlUrl } from 'state/Config/selectors';
import { ITEM_NOT_FOUND } from 'state/News/constants';
import { PAGE_TYPE } from 'constants/pageType';
import type { Article } from 'state/News/types';
import type { GetAsyncData, State } from 'state/types';

const notFound = {
  blocks: [
    {
      html: "We're sorry! The article you were looking for is no longer available. Go to Latest News for more news about your favorite artists or visit our Homepage to explore iHeart.",
      type: 'html',
    },
    { type: 'notFoundButtons' },
  ],
  error: true,
  fb_allow_comments: false,
  routeStatus: 404,
  slug: '404',
  title: 'This article is no longer available',
};

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { logger, transport }) => {
    try {
      const state = getState();
      const slug = getSlug(state);
      const { external_url: redirectUrl } = await dispatch(getArticle(slug));
      return { redirectUrl };
    } catch (error: any) {
      const errObj = new Error(
        error?.statusText || error?.message || 'error getting articles',
      );

      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.NEWS],
        errObj.message,
        {},
        errObj,
      );

      if (error?.response?.status === 404 || error.message === ITEM_NOT_FOUND) {
        const state = getState();

        const { httpStatus, url } = await getRadioEditRedirect(transport, {
          apiEndpoint: getWebGraphQlUrl(state),
          originalQuery: getQueryParams(state),
          pathname: getCurrentPath(state),
          siteUrl: getSiteUrl(state),
        });

        if (!url) {
          return dispatch(articlesLoaded([notFound as unknown as Article]));
        }

        return {
          redirectUrl: url,
          routeStatus: httpStatus,
        };
      }

      throw errObj;
    }
  };

export function pageInfo(state: State) {
  const pageId = getSlug(state);
  const artistId = getArtistId(state);
  const keywords = getAdKeywords(state);
  const topics = getAdTopics(state);
  const theme = getTheme(state);

  return {
    artist_id: artistId,
    author_id: getFeedVendor(state) || getCUser(state).split('/').slice(-1)[0],
    eyesToEars: getEyesToEarsBlocks(state),
    feed_name: theme,
    galleries: getGalleryBlocks(state),
    keywords: getAdKeywords(state),
    pageId,
    pageType: PAGE_TYPE.CONTENT,
    published_at: getPublishDate(state) / 1000,
    resource_id: getResourceId(state),
    targeting: {
      name: 'news',
      modelId: String(pageId),
      artistId,
      keywords,
      contentcategory: theme,
      contentdetail: String(pageId),
      contenttype: 'articles',
    },
    title: getSeoTitle(state),
    topics,
  };
}
