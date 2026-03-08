import HeroThumbnail from 'primitives/Hero/HeroThumbnail';
import MediaServerImage, {
  TILE_FIT,
  TILE_RES,
} from 'components/MediaServerImage';
import PlaylistImage from 'components/MediaServerImage/PlaylistImage';
import PrimaryBackgroundImage from 'primitives/Hero/PrimaryBackgroundImage';
import { blur, fit, gravity, run } from 'utils/mediaServerImageMaker/opsString';
import { buildCatalogUrl } from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { identity } from 'lodash-es';
import { isPlaylist } from 'state/Playlist/helpers';
import { STATION_TYPE } from 'constants/stationTypes';

const PlaylistThumbnail = HeroThumbnail.withComponent(PlaylistImage);

export function resolveAltText(
  title?: string,
  seedType?: string,
  fallback = '',
  prefix = '',
) {
  if (!title) return fallback;
  let withImageType;
  if (seedType === STATION_TYPE.ARTIST) {
    withImageType = title;
  } else if (seedType === STATION_TYPE.ALBUM) {
    withImageType = `${title} art`;
  } else {
    withImageType = `${title} logo`;
  }
  return prefix ? `${prefix} ${withImageType}` : withImageType;
}

export function PrimaryBackground({
  src,
  mediaServerUrl: _mediaServerUrl,
  siteUrl: _siteUrl,
  title,
  seedType,
  ...props
}: {
  background?: boolean;
  src?: string;
  mediaServerUrl: string;
  ops?: Array<any>;
  siteUrl: string;
  title?: string;
  seedType?: string;
}) {
  return src ?
      <PrimaryBackgroundImage
        alt={resolveAltText(title, seedType, 'Primary Background')}
        background
        src={src}
        {...props}
      />
    : null;
}

export function TabletBackground({
  seedType,
  seedId,
  mediaServerUrl,
  customBlur = 40,
  src,
  title,
  ...props
}: {
  height?: number;
  seedType: string;
  seedId: string;
  mediaServerUrl: string;
  customBlur?: number;
  src?: string;
  title?: string;
  width?: number;
}) {
  return isPlaylist(seedType) ?
      <PlaylistImage
        alt={resolveAltText(title, seedType, 'Tablet Background', 'blurred')}
        background
        blurSigma={customBlur}
        ops={[gravity('center'), blur(customBlur)]}
        src={src}
        {...props}
      />
    : <MediaServerImage
        alt={resolveAltText(title, seedType, 'Tablet Background', 'blurred')}
        background
        id={seedId}
        ops={[fit(1800, 720), gravity('center'), blur(customBlur)]}
        src={
          src ||
          buildCatalogUrl(mediaServerUrl, {
            id: seedId,
            resourceType: seedType,
          })
        }
        type={seedType}
        {...props}
      />;
}

export function Thumbnail({
  seedType,
  seedId,
  mediaServerUrl,
  src,
  extraOps = [],
  title,
  className,
  ...props
}: {
  alt?: string;
  aspectRatio?: number;
  seedType: string;
  seedId: string | number;
  sync?: boolean;
  mediaServerUrl: string;
  siteUrl?: string;
  src?: string;
  extraOps?: Array<any>;
  title?: string;
  className?: string;
  width?: number;
}) {
  return isPlaylist(seedType) ?
      <PlaylistThumbnail
        alt={resolveAltText(title, seedType, 'Background Thumbnail')}
        aspectRatio={1}
        ops={extraOps}
        src={src}
        sync
        width={TILE_RES}
        {...props}
      />
    : <HeroThumbnail
        alt={resolveAltText(title, seedType, 'Background Thumbnail')}
        aspectRatio={1}
        className={className}
        ops={[
          fit(...TILE_FIT),
          seedType === STATION_TYPE.ARTIST ? run('circle') : identity,
          ...extraOps,
        ]}
        src={
          src ||
          buildCatalogUrl(mediaServerUrl, {
            id: seedId,
            resourceType: seedType,
          })
        }
        sync
        {...props}
      />;
}
