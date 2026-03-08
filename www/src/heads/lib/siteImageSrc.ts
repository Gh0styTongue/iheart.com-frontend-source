import { fbLogo } from 'constants/assets';
import { metaResolveUrl } from 'utils/metaUtils';
import { parse } from 'url';

export default (
  siteUrl: string,
  customImage?: string,
  urlEncodeImage = true,
): string => {
  const imageSrc = customImage || fbLogo;
  const parsed = parse(imageSrc, urlEncodeImage);
  if (!parsed.host) {
    return metaResolveUrl(siteUrl, imageSrc);
  } else if (!parsed.protocol) {
    return `https:${imageSrc}`;
  } else {
    return imageSrc;
  }
};
