/* Use this head for custom meta tags, followed by view's own head
 *  Structure will look like
 * <div>
 *   <GenericHead
 *     description="Blah Blah Radio"
 *     siteUrl={store.environment.siteUrl}
 *     fbAppId={store.social.fbAppId}
 *     fbPages={store.social.fbPages}
 *     pagePath="gossips"
 *   />
 *   <YourViewHead />
 * </div>
 */

import baseLink from 'heads/base/link';
import baseMeta from 'heads/base/meta';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { FunctionComponent } from 'react';
import { getCurrentPath } from 'state/Routing/selectors';
import { getFacebookAppId, getFacebookPages } from 'state/Social/selectors';
import { getSiteUrl } from 'state/Config/selectors';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';

type Props = Omit<
  Parameters<typeof baseLink>[0] & Parameters<typeof baseMeta>[0],
  'fbAppId' | 'fbPages' | 'pagePath' | 'siteUrl' | 'translate'
> & { urlEncodeImage?: boolean; twitterImage?: string; facebookImage?: string };

const GenericHead: FunctionComponent<Props> = ({
  deeplink = '',
  description,
  image,
  urlEncodeImage = true,
  legacyDeeplink,
  noAltLink,
  ogType,
  omitTitleEnding,
  metaDescription,
  socialTitle,
  title,
  twitterCard = 'summary',
  twitterImage,
  facebookImage,
}) => {
  const fbAppId = useSelector(getFacebookAppId);
  const fbPages = useSelector(getFacebookPages);
  const pagePath = useSelector(getCurrentPath);
  const siteUrl = useSelector(getSiteUrl);
  const translate = useTranslate();

  return (
    <Helmet
      encodeSpecialCharacters={urlEncodeImage}
      link={baseLink({
        deeplink,
        image,
        noAltLink,
        pagePath,
        siteUrl,
      })}
      meta={baseMeta({
        description,
        fbAppId,
        fbPages,
        image,
        urlEncodeImage,
        legacyDeeplink,
        metaDescription,
        ogType,
        omitTitleEnding,
        pagePath,
        siteUrl,
        socialTitle,
        title,
        translate,
        twitterCard,
        twitterImage,
        facebookImage,
      })}
      title={title}
    />
  );
};

export default GenericHead;
