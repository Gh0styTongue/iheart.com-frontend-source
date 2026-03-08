import logger, { CONTEXTS } from 'modules/Logger';
import MediaServerImage from 'components/MediaServerImage';
import { buildCatalogUrl } from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { fit } from 'utils/mediaServerImageMaker/opsString';
import { identity } from 'lodash-es';
import { Props as MediaServerImageProps } from 'components/MediaServerImage/MediaServerImage';
import { placeholder } from 'constants/assets';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';

type Props = MediaServerImageProps & {
  height?: number;
  id?: number | string;
  mediaServerUrl: string;
  ops?: Array<(...args: Array<any>) => any>;
  src?: string;
  type?: StationTypeValue;
  width?: number;
};

function CatalogImage({
  id,
  src,
  ops = [],
  type,
  width,
  height,
  mediaServerUrl,
  ...props
}: Props) {
  if (type === STATION_TYPE.LIVE && src === placeholder) {
    logger.warn(
      CONTEXTS.REACT,
      'Cannot generate live station image without a src prop',
    );
  }

  let source;
  if (src?.length) source = src;
  else if (type && id)
    source = buildCatalogUrl(mediaServerUrl, { id, resourceType: type });
  else source = placeholder;

  return (
    <MediaServerImage
      ops={[
        width ? fit(width, height || width) : identity,
        ...ops.filter(x => x),
      ]}
      src={source}
      {...props}
    />
  );
}

export default CatalogImage;
