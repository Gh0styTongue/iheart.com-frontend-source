import HolidayHatLogo from './primitives/HolidayHatLogo';
import { fit } from 'utils/mediaServerImageMaker/opsString';

type Props = {
  url: string;
};

function ImgLogo({ url }: Props) {
  return (
    <HolidayHatLogo
      alt="iHeart"
      aspectRatio={0}
      ops={[fit(120, 40)]}
      src={url}
    />
  );
}

export default ImgLogo;
