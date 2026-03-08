import { Article, ArticleGraphQlEntity } from './types';
import { BlockType } from 'components/ArticleBody/types';
import { fbLogo } from 'constants/assets';
import { ITEM_NOT_FOUND } from './constants';
import type { Block } from './types';

/**
 * Determines if a URL represents an IHR widget embed based on the hostname and 'embed' query param.
 *
 * @param url - A URL object
 * @returns Whether or not the URL represents an IHR widget URL
 */
const isWidgetUrl = (url: URL) =>
  url.hostname.includes('iheart.com') &&
  url.searchParams.get('embed') === 'true';

/**
 * Appends the 'ihrnetwork=true' query param to widget embed URLs.
 *
 * @param block - A News page content block.
 * @returns The modified block.
 */
export const addIhrNetworkQueryParam = (block: Block) => {
  if (block.type === BlockType.Embed) {
    const { html } = block;

    // Capture the iframe's "src" value
    // `block.url` should not be used to match against `block.html`'s iframe "src" value , as they aren't always the same
    const match = html.match(/<iframe.+src\s*=\s*"(.+?)"/);

    // If there's a match, the captured value of "src" is the URL we want to alter
    if (match && match[1]) {
      const oldUrl = match[1];

      try {
        const newUrl = new URL(oldUrl);

        if (isWidgetUrl(newUrl)) {
          newUrl.searchParams.set('ihrnetwork', 'true');

          return {
            ...block,
            html: html.replace(oldUrl, newUrl.toString()),
          };
        }
      } catch (e) {
        return block;
      }
    }
  }

  return block;
};

export function mapGraphQlResponse(
  item: ArticleGraphQlEntity,
  extensions: Array<string> = [],
  lookup: Array<string> = [],
): Article {
  if (item && Object.keys(item).length) {
    const dataskriveAnalyticsProps = lookup.filter(
      entry => typeof entry === 'string' && entry.includes('custom:dataskrive'),
    );
    const { dataskriveAnalyticsToken, dataskriveContentToken } =
      dataskriveAnalyticsProps.reduce(
        (acc, curr) => {
          const [, key, value] = curr.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string | undefined>,
      );

    return {
      '@img': item.summary.image || fbLogo,
      adKeywords: item.ad_params.keywords,
      adTopics: item.ad_params.topics,
      amp_enabled: item.payload.amp_enabled,
      author: item.summary.author,
      blocks: (item.payload?.blocks ?? []).map(addIhrNetworkQueryParam),
      canonical_url: item.payload.canonical_url,
      cuser: item.payload.cuser,
      external_url: item.payload.external_url,
      fb_allow_comments: item.payload.fb_allow_comments,
      feed_permalink: item.payload.feed_permalink,
      feed_vendor: item.payload.feed_vendor,
      include_recommendations: item.payload.include_recommendations,
      is_sponsored: item.payload.is_sponsored,
      keywords: item.payload.keywords,
      publish_date: item.pub_start,
      publish_origin: item.payload.publish_origin,
      resource_id: (item.ref_id || '').replace(/\//, ''),
      seo_title: item.payload.seo_title,
      show_updated_timestamp: item.payload.show_updated_timestamp,
      slug: item.slug,
      social_title: item.payload.social_title,
      summary: item.summary.description,
      tags: item?.subscription?.[0]?.tags ?? [],
      title: item.summary.title,
      update_date: item.pub_changed,
      emits: extensions,
      dataskriveAnalyticsToken,
      dataskriveContentToken,
    };
  }

  throw new Error(ITEM_NOT_FOUND);
}
