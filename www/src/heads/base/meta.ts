import CONSTANTS from '../constants';
import siteImageSrc from '../lib/siteImageSrc';
import { fbLogo } from 'constants/assets';
import { getShareMessage } from 'constants/sharing';
import { IGetTranslateFunctionResponse } from 'redux-i18n';
import { MetaObject } from '../types';
import {
  metaResolveUrl as resolveUrl,
  translateKeywords,
} from 'utils/metaUtils';

type Props = {
  image?: string;
  urlEncodeImage?: boolean;
  description?: string;
  metaDescription?: string;
  legacyDeeplink?: string;
  siteUrl: string;
  fbAppId: string;
  fbPages: string;
  pagePath: string;
  socialTitle?: string;
  twitterCard?: string;
  twitterImage?: string;
  facebookImage?: string;
  title: string;
  ogType?:
    | 'music.radio_station'
    | 'profile'
    | 'article'
    | 'music.song'
    | 'music.album'
    | 'music.playlist'
    | 'video'
    | 'website';
  translate: IGetTranslateFunctionResponse;
  omitTitleEnding?: boolean;
};

export default (props: Props): Array<MetaObject> => {
  const {
    image = fbLogo,
    urlEncodeImage = true,
    description,
    metaDescription,
    legacyDeeplink,
    siteUrl,
    fbAppId,
    fbPages,
    pagePath,
    socialTitle,
    twitterCard = 'summary',
    twitterImage,
    facebookImage,
    title,
    ogType,
    translate,
    omitTitleEnding,
  } = props;

  const imageSrc = siteImageSrc(siteUrl, image, urlEncodeImage);
  const url = resolveUrl(siteUrl, pagePath);
  const legacyDeeplinkUrl = legacyDeeplink ? `ihr://${legacyDeeplink}` : '';

  const defaultDescription = getShareMessage(translate);

  const titleEnding =
    omitTitleEnding ? '' : `| ${translateKeywords(translate, 'iHeart')}`;
  // IHRWEB-16146 description could contain HTML with " characters. Need to remove these to prevent breaking meta tags
  const sanitizedDescription =
    description === null ? null : (description?.replace(/"/g, "'") ?? '');
  return [
    {
      content:
        sanitizedDescription === null ? null : (
          metaDescription || sanitizedDescription || defaultDescription
        ),
      name: 'description',
    },
    { content: fbAppId, property: 'fb:app_id' },
    { content: fbPages, property: 'fb:pages' },
    ...(ogType ? [{ content: ogType, property: 'og:type' }] : []),
    { content: imageSrc, name: 'thumbnail' },
    { content: twitterImage || imageSrc, name: 'twitter:image' },
    { content: facebookImage || imageSrc, property: 'og:image' },

    ...(sanitizedDescription ?
      [
        { content: sanitizedDescription, itemprop: 'description' },
        { content: sanitizedDescription, property: 'og:description' },
        { content: sanitizedDescription, name: 'twitter:description' },
      ]
    : []),

    { content: url, property: 'og:url' },
    { content: url, name: 'twitter:url' },

    { content: CONSTANTS.APP_NAME, property: 'og:site_name' },
    { content: CONSTANTS.APP_NAME, name: 'twitter:app:name:iphone' },
    { content: CONSTANTS.APP_NAME, name: 'twitter:app:name:ipad' },
    { content: CONSTANTS.APP_NAME, name: 'twitter:app:name:googleplay' },
    { content: CONSTANTS.APP_NAME, name: 'al:android:app_name' },
    { content: CONSTANTS.APP_NAME, name: 'al:ios:app_name' },

    { content: CONSTANTS.APP_NAME_TWITTER, name: 'twitter:creator' },
    { content: CONSTANTS.APP_NAME_TWITTER, name: 'twitter:site' },

    { content: twitterCard, name: 'twitter:card' },
    { content: CONSTANTS.WEB_SITE, name: 'twitter:domain' },

    { content: CONSTANTS.APPLE_ID, name: 'twitter:app:id:iphone' },
    { content: CONSTANTS.APPLE_ID, name: 'twitter:app:id:ipad' },
    { content: CONSTANTS.APPLE_ID, name: 'al:ios:app_store_id' },

    { content: CONSTANTS.GOOGLE_PLAY_ID, name: 'twitter:app:id:googleplay' },
    { content: CONSTANTS.GOOGLE_PLAY_ID, name: 'al:android:package' },

    { content: `${title} ${titleEnding}`, itemprop: 'name' },

    { content: `${socialTitle || title} ${titleEnding}`, property: 'og:title' },
    {
      content: `${socialTitle || title} ${titleEnding}`,
      name: 'twitter:title',
    },

    ...(legacyDeeplinkUrl ?
      [
        { content: legacyDeeplinkUrl, name: 'twitter:app:url:iphone' },
        { content: legacyDeeplinkUrl, name: 'twitter:app:url:ipad' },
        { content: legacyDeeplinkUrl, name: 'twitter:app:url:googleplay' },
        { content: legacyDeeplinkUrl, property: 'al:android:url' },
        { content: legacyDeeplinkUrl, property: 'al:ios:url' },
      ]
    : []),
  ];
};
