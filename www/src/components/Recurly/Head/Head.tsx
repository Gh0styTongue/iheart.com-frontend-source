import GenericHead from 'components/GenericHead';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { Helmet } from 'react-helmet';
import { translateKeywords } from 'utils/metaUtils';

function Head() {
  const translate = useTranslate();

  const description = translate(
    'Discover how you can save and replay music on your favorite radio stations, or download and listen offline to millions of songs!',
  );

  const title = translate('iHeart Plus & All Access - Upgrade to a Free Trial');

  return (
    <>
      <GenericHead
        deeplink="goto/upgrade"
        description={description}
        legacyDeeplink="goto/upgrade"
        metaDescription={description}
        ogType="website"
        title={title}
      />
      <Helmet
        meta={[
          {
            content: translateKeywords(
              translate,
              'iHeart Plus,iHeart All Access,Upgrade,Download,Commercial Free,On Demand,Unlimited Skips,Playlists,Save Songs,Replay Songs',
            ),
            name: 'keywords',
          },
        ]}
      />
    </>
  );
}

export default Head;
