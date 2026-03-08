import GenericHead from 'components/GenericHead';
import RichResults from 'components/RichResults';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { getScaledImageUrlById } from 'utils/url';
import { Helmet } from 'react-helmet';
import { link as playerLink, meta as playerMeta } from 'heads/player';
import {
  metaResolveUrl as resolveUrl,
  translateKeywords,
} from 'utils/metaUtils';
import { ViewName } from 'views/PageBody';
import {
  WIDGET_DIMENSIONS,
  WidgetDimensions,
} from 'constants/widgetDimensions';
import type { Track } from 'state/Artists/types';

type Props = {
  artistId: number;
  artistName: string;
  metaTitle: string;
  pagePath: string;
  seedType: string;
  siteUrl: string;
  topTracks: Array<Track>;
};

function Head({
  artistId,
  artistName,
  seedType,
  siteUrl,
  pagePath,
  topTracks,
  metaTitle,
}: Props) {
  const translate = useTranslate();

  const keywords = translateKeywords(
    translate,
    'Music, Albums, Songs, Station, Lyrics, Download, Now Playing, iHeartRadio, iHeart, Radio',
  );
  const dynamicKeywords = translate('{artistName}', { artistName });

  const description = topTracks
    .slice(0, 3)
    .map(track => track?.name ?? '')
    .join(', ');

  const title = metaTitle || artistName;

  const fullUrl = resolveUrl(siteUrl, pagePath);

  const { height, fixedWidth: width }: WidgetDimensions =
    WIDGET_DIMENSIONS.ARTIST ?? {};

  return (
    <div>
      <GenericHead
        deeplink={`goto/artist/${artistId}`}
        description={description}
        image={getScaledImageUrlById(artistId, seedType)}
        legacyDeeplink={`play/custom/artist/${artistId}`}
        metaDescription={description}
        ogType="music.radio_station"
        title={title}
      />
      <Helmet
        link={playerLink({ pagePath, siteUrl, title })}
        meta={[
          { content: title, itemProp: 'name' },
          { content: `${dynamicKeywords}, ${keywords}`, name: 'keywords' },
          ...playerMeta({ height, pagePath, siteUrl, width }),
        ]}
      />
      <RichResults
        meta={{
          description,
          id: artistId,
          keywords: `${dynamicKeywords}, ${keywords}`,
          name: artistName,
          seedType,
          url: fullUrl,
        }}
        type={ViewName.ArtistProfile}
      />
    </div>
  );
}

export default Head;
