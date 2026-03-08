import ProfileImage from './primitives/ProfileImage';
import {
  addOps,
  buildImageUrl,
  buildUserUrl,
} from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { buildOpsString, fit } from 'utils/mediaServerImageMaker/opsString';
import { getMediaServerUrl } from 'state/Config/selectors';
import { getProfileId } from 'state/Session/selectors';
import { useSelector } from 'react-redux';

type Props = {
  dataTest?: string;
  size: number;
};

function ProfilePic({ dataTest, size }: Props) {
  const mediaServerUrl = useSelector(getMediaServerUrl);
  const profileId = useSelector(getProfileId);

  return (
    <ProfileImage
      alt="Profile"
      aspectRatio={1}
      background
      data-test={dataTest ?? 'profile-Img'}
      size={size}
      src={buildImageUrl(
        buildUserUrl(mediaServerUrl, profileId!),
        addOps(buildOpsString(fit(size, size))()),
      )()}
    />
  );
}

export default ProfilePic;
