import Image from 'components/Image';
import {
  addOps,
  buildImageUrl,
  buildUrl,
} from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { buildOpsString } from 'utils/mediaServerImageMaker/opsString';
import { GetProps } from 'react-redux';
import { placeholder } from 'constants/assets';

export type Props = Omit<GetProps<typeof Image>, 'className' | 'src'> & {
  className?: string;
  id?: number | string;
  mediaServerUrl: string;
  ops?: Array<(...args: Array<any>) => any>;
  crossOrigin?: boolean;
  siteUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  src?: Function | string;
  type?: string;
};

function MediaServerImage({
  src = placeholder,
  siteUrl,
  mediaServerUrl,
  ops = [],
  ...props
}: Props) {
  return (
    <Image
      src={buildImageUrl(
        ...(typeof src === 'function' ?
          [src, addOps(buildOpsString(...ops)())]
        : [
            buildUrl({ mediaServerUrl, siteUrl }, src),
            addOps(buildOpsString(...ops)()),
          ]),
      )()}
      {...props}
    />
  );
}

export default MediaServerImage;
