/* eslint-disable camelcase */
import { CONTEXTS } from 'modules/Logger';
import { getNewsArticles, getTopic } from '../services';
import { getWebGraphQlUrl } from 'state/Config/selectors';
import { LOAD_NEWS_DIRECTORY } from '../constants';
import { Thunk } from 'state/types';

/**
 * TODO:
 *   The Radio Edit endpoints in use are currently in flux.
 *   Eventually, topic information will alongside articles
 *   via GraphQL. That is currently not the case, requiring
 *   us to both infer the topic from tags and make extra calls
 *   to get information associated with that particular topic.
 *
 *   Once we get the finalized API, those __temp_ functions
 *   below will likely no longer be necessary.
 *
 */

type TopicData =
  | Record<string, unknown>
  | {
      description: string;
      display_name: string;
    };

type ParsedArticles = Array<{
  payload: never;
  subscription: never;
}>;

type Resume = {
  id: string;
  context: Record<string, unknown>;
  scopes: null;
  size: number;
  from: string;
};

type GenericResponse<T> = { data: { data: T } };
type ArticlesResponse = GenericResponse<{
  sites: {
    find: {
      config: {
        timeline: {
          results: Array<{
            data: {
              subscription: Array<{ tags: Array<string> }>;
              payload: any;
            };
            type: string;
          }>;
          resume: Resume;
        };
      };
    };
  };
}>;
type TopicResponse = GenericResponse<{
  taxonomy: {
    topic: {
      name: string;
      source: {
        display_name: string;
        description: string;
      };
    };
  };
}>;

type TempTopic = {
  slug: string;
  name: string;
  description: string | null;
};

type Fetcher = {
  (
    serviceFn: { (arg0: any): any },
    serviceArg: Record<string, unknown>,
  ): Promise<GenericResponse<any>>;
};

const deriveArticleTopicFromTags = (tags: Array<string>): string =>
  tags
    .filter((t: string) => /^(?:collections|categories)\//.test(t))
    .map((t: string) => t.replace(/^(?:collections|categories)\//, ''))[0] ||
  '';

async function __temp_getArticles(
  fetcher: Fetcher,
  args: { pageResumeParams: Resume | null; slug: string; topicSlug?: string },
): Promise<{
  articles: ParsedArticles;
  articleTopicSlugs: Array<string>;
  resume: Resume;
}> {
  const articlesResponse: ArticlesResponse = await fetcher(
    getNewsArticles,
    args,
  );
  const { results, resume } = articlesResponse?.data?.data?.sites?.find?.config
    ?.timeline ?? {
    results: [],
    resume: null,
  };
  const filteredResults = results.filter(({ type }) => type === 'PUBLISHING');
  const articleTopicSlugs: Array<string> = filteredResults.map(
    ({ data: { subscription } }) =>
      deriveArticleTopicFromTags(subscription[0].tags),
  );
  const articles = filteredResults.map(
    ({
      data: {
        // we need to pull out subscription and blocks to avoid html in our state tree
        // which screws up our serialization into the initial server render.
        subscription: _subscription,
        payload: { blocks: _blocks, ...payload },
        ...article
      },
    }) => ({ ...article, payload }),
  ) as ParsedArticles;
  return { articles, articleTopicSlugs, resume };
}

async function __temp_getTopic(
  fetcher: Fetcher,
  topicSlug: string,
): Promise<TempTopic> {
  const topicResponse: TopicResponse = await fetcher(getTopic, {
    topicSlug,
  });
  const { display_name: name, description } = topicResponse?.data?.data
    ?.taxonomy?.topic?.source ?? { display_name: '', description: '' };
  return { description: description || null, name, slug: topicSlug };
}

export default function loadNewsArticles(
  slug: string,
  topicSlug?: string,
  pageResumeParams: Resume | null = null,
): Thunk<void> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const baseUrl = getWebGraphQlUrl(getState());
    let topicData: TopicData = {};
    let parsedArticles: ParsedArticles = [];

    const fetcher: Fetcher = async (serviceFn, serviceArg) => {
      let responseData;
      try {
        responseData = await transport(serviceFn({ ...serviceArg, baseUrl }));
      } catch (e: any) {
        const errObj =
          e instanceof Error ? e : new Error(e.message ?? 'unable to fetch');
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.NEWS],
          errObj.message,
          {},
          errObj,
        );
        throw errObj;
      }
      return responseData as GenericResponse<any>;
    };
    const { articles, resume } = await __temp_getArticles(fetcher, {
      pageResumeParams,
      slug,
      topicSlug,
    });

    if (topicSlug) {
      // this is a topic feed, so we only have to get the info for one topic
      const { name, description } = await __temp_getTopic(fetcher, topicSlug);
      topicData = { description, display_name: name };
    }
    parsedArticles = articles;

    return dispatch({
      payload: {
        articles: parsedArticles,
        pageResumeParams: resume || null,
        siteSlug: slug,
        topicData,
        topicSlug,
      },
      type: LOAD_NEWS_DIRECTORY,
    });
  };
}
