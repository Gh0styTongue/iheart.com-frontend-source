import CONSTANTS from '../constants';
import opensearchUrl from '../assets/opensearch.xml';
import siteImageSrc from '../lib/siteImageSrc';
import { LinkObject } from '../types';
import { metaResolveUrl } from 'utils/metaUtils';

type Props = {
  deeplink?: string;
  image?: string;
  noAltLink?: boolean;
  pagePath: string;
  siteUrl: string;
};

export default ({
  deeplink,
  image,
  noAltLink,
  pagePath,
  siteUrl,
}: Props): Array<LinkObject> => {
  const imageSrc = siteImageSrc(siteUrl, image);
  const opensearch = metaResolveUrl(siteUrl, opensearchUrl);
  const url = metaResolveUrl(siteUrl, pagePath);

  return [
    ...(noAltLink || !deeplink ?
      []
    : [
        {
          href: `android-app://com.clearchannel.iheartradio.controller/ihr/${deeplink}`,
          rel: 'alternate',
        },
        {
          href: `ios-app://${CONSTANTS.APPLE_ID}/ihr/${deeplink}`,
          rel: 'alternate',
        },
      ]),
    {
      href: opensearch,
      rel: 'search',
      title: CONSTANTS.APP_NAME,
      type: 'application/opensearchdescription+xml',
    },
    { href: 'https://plus.google.com/+iHeartRadio', rel: 'author' },
    { href: 'https://plus.google.com/+iHeartRadio', rel: 'publisher' },
    { href: url, rel: 'canonical' },
    { href: imageSrc, rel: 'image_src' },
  ];
};
