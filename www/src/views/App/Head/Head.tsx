import useTranslate from 'contexts/TranslateContext/useTranslate';
import { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';
import { link, meta, script } from 'heads/app';
import { translateKeywords } from 'utils/metaUtils';

type Props = Parameters<typeof link>[0] & {
  lang: string;
};

const Head: FunctionComponent<Props> = ({
  ampUrl,
  mediaServerUrl,
  contentUrl,
  leadsUrl,
  reGraphQlUrl,
  lang,
}) => {
  const translate = useTranslate();

  return (
    <Helmet
      defaultTitle={translate(
        'iHeart: Listen to Free Radio Stations & Music Online | iHeart',
      )}
      htmlAttributes={{ lang, 'xmlns:fb': 'http://ogp.me/ns/fb#' }}
      link={link({
        ampUrl,
        mediaServerUrl,
        contentUrl,
        leadsUrl,
        reGraphQlUrl,
      })}
      meta={meta()}
      script={script()}
      titleTemplate={`%s | ${translateKeywords(translate, 'iHeart')}`}
    />
  );
};

export default Head;
