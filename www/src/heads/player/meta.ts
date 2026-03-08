import createSortedQueryString from '../utils/createSortedQueryString';
import { MetaObject } from '../types';
import { metaResolveUrl } from 'utils/metaUtils';

type WidgetMetaObject = MetaObject & {
  content: string;
  itemProp?: string;
  key?: string;
  name?: string;
  property?: string;
};

type Props = {
  addEmbedToLink?: boolean;
  pagePath: string;
  siteUrl: string;
  height: string | number;
  width: string | number;
};

type Qs = { embed?: boolean };
const embedQs = ({ embed }: Qs): string => {
  const queryStringObj: Qs = {};
  if (embed) {
    queryStringObj.embed = true;
  }
  return Object.keys(queryStringObj).length ?
      `?${createSortedQueryString(queryStringObj)}`
    : '';
};

export default ({
  height,
  addEmbedToLink = false,
  pagePath,
  siteUrl,
  width,
}: Props): Array<WidgetMetaObject> => {
  const fullUrl = metaResolveUrl(siteUrl, pagePath);
  const facebookUrl = fullUrl + embedQs({ embed: addEmbedToLink });
  const facebookUrlVideo = fullUrl + embedQs({ embed: true });
  const twitterUrl = fullUrl + embedQs({ embed: addEmbedToLink });
  return [
    { content: 'audio', key: 'twitter:card', property: 'twitter:card' },
    { content: twitterUrl, key: 'twitter:url', name: 'twitter:url' },
    { content: twitterUrl, key: 'twitter:player', name: 'twitter:player' },
    {
      content: `${width}`,
      key: 'twitter:player:width',
      name: 'twitter:player:width',
    },
    {
      content: `${height}`,
      key: 'twitter:player:height',
      name: 'twitter:player:height',
    },

    { content: 'text/html', key: 'og:video:type', property: 'og:video:type' },
    {
      content: 'audio/vnd.facebook.bridge',
      key: 'og:audio:type',
      property: 'og:audio:type',
    },
    { content: facebookUrl, key: 'og:url', property: 'og:url' },
    { content: facebookUrl, key: 'og:audio', property: 'og:audio' },
    {
      content: facebookUrlVideo,
      key: 'og:video:url',
      property: 'og:video:url',
    },
    {
      content: facebookUrlVideo,
      key: 'og:video:secure_url',
      property: 'og:video:secure_url',
    },
    { content: `${width}`, key: 'og:video:width', property: 'og:video:width' },
    {
      content: `${height}`,
      key: 'og:video:height',
      property: 'og:video:height',
    },
  ];
};
