import Image from 'components/Image';
import styled from '@emotion/styled';

type Props = {
  size: number;
};

const ProfileImage = styled(Image)<Props>(({ size }) => ({
  borderRadius: size / 2,
  height: size,
  overflow: 'hidden',
  width: size,
}));

export default ProfileImage;
