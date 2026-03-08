import articlesLoaded from './articlesLoaded';
import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import { getArticle as getArticleService } from 'state/News/services';
import { getWebGraphQlUrl } from 'state/Config/selectors';
import { mapGraphQlResponse } from 'state/News/helpers';
import type { Article } from '../types';
import type { Thunk } from 'state/types';

export default function getArticle(slug: string): Thunk<Promise<Article>> {
  return async function thunk(dispatch, getState, { logger }) {
    try {
      const state = getState();
      const webGraphQlUrl = getWebGraphQlUrl(state);
      const transportData = await transport(
        getArticleService({ baseUrl: webGraphQlUrl, slug }),
      );
      const responseData = transportData?.data?.data?.content?.item ?? {};
      const extensions = transportData?.data?.extensions?.emits ?? [];
      const lookupData = transportData?.data?.data?.pubsub?.get?.lookup ?? [];
      const articleData = mapGraphQlResponse(
        responseData,
        extensions,
        lookupData,
      );
      dispatch(articlesLoaded([articleData]));
      return articleData;
    } catch (e) {
      const errObj = e instanceof Error ? e : new Error(e as string);
      logger.error([CONTEXTS.REDUX, CONTEXTS.NEWS], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}
