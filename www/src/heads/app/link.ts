import manifest from '../assets/manifest.json';
import { appleTouchIcon, favicon } from 'constants/assets'; // LOADER IS OVERRIDDEN IN WEBPACK CONFIGS
import { LinkObject } from '../types';

type Props = {
  ampUrl: string;
  mediaServerUrl: string;
  contentUrl: string;
  leadsUrl: string;
  reGraphQlUrl: string;
};

export default ({
  ampUrl,
  mediaServerUrl,
  contentUrl,
  leadsUrl,
  reGraphQlUrl,
}: Props): Array<LinkObject> => [
  { href: favicon, rel: 'shortcut icon', type: 'image/ico' },
  { href: appleTouchIcon, rel: 'apple-touch-icon' },
  { href: appleTouchIcon, rel: 'shortcut icon' },
  { href: `${manifest}`, rel: 'manifest' },
  { href: ampUrl, rel: 'dns-prefetch' },
  { href: mediaServerUrl, rel: 'dns-prefetch' },
  { href: leadsUrl, rel: 'dns-prefetch' },
  { href: contentUrl, rel: 'dns-prefetch' },
  { href: reGraphQlUrl, rel: 'dns-prefetch' },
  { href: 'https://web-static.pages.iheart.com', rel: 'dns-prefetch' },
];
