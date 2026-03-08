/* eslint-disable camelcase */
import type { Article } from 'state/News/types';

type ContentData = {
  adKeywords: string;
  adTopics: string;
  article: Article;
  slug: string;
  blockedPIIBehaviors: {
    sanitizeAds: boolean;
    sanitizeStreams: boolean;
    turnOffAndo: boolean;
    turnOffOutbrain: boolean;
  };
  subInfoLoaded: boolean;
};

export function shouldOutbrainBeEnabled(data: ContentData): boolean {
  const article = data?.article ?? {};
  return !!(
    !data?.blockedPIIBehaviors?.turnOffOutbrain &&
    data?.slug &&
    data?.subInfoLoaded &&
    !article.is_sponsored &&
    article.include_recommendations
  );
}

export const getContentAnalyticsData = (data: ContentData) => {
  const article = data?.article ?? {};
  const hasGallery = (article?.blocks ?? []).some(
    block => block.type === 'gallery',
  );

  const outbrain = shouldOutbrainBeEnabled(data);

  const tags = data?.adKeywords ?? article?.adKeywords ?? '';
  const formattedTopics = (data?.adTopics ?? article?.adTopics ?? '').split(
    ',',
  );
  const contentOrigin = (article?.publish_origin ?? '').split('/').slice(-1)[0];
  const contentOriginType =
    (
      contentOrigin.toLowerCase().includes('iheartradio') ||
      contentOrigin.toLowerCase().includes('default-')
    ) ?
      'National'
    : 'Local';

  return {
    authorId:
      article?.feed_vendor ?? (article?.cuser ?? '').split('/').slice(-1)[0],
    contentId: article?.resource_id ?? '',
    contentOrigin,
    contentOriginType,
    formattedTopics, // so as not to overwrite PageInfo `topics` string
    id: `content|${data?.slug ?? article?.slug ?? ''}`,
    name: article?.seo_title ?? '',
    pageName: 'content',
    photoGalleryExists: `${hasGallery}`,
    photoGalleryPageView: 'false',
    pubDate: article?.publish_date?.toString() ?? '',
    tags,
    ...(outbrain ? { outbrain: 'enabled' } : {}),
  };
};
