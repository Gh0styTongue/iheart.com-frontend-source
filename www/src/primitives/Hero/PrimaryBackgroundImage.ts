import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import MediaServerImage from 'components/MediaServerImage';
import styled from '@emotion/styled';

const PrimaryBackgroundImage = styled(MediaServerImage)(({ theme }) => ({
  animation: 'fades-in 1s',
  left: '50%',
  maxWidth: 'none',
  position: 'absolute',
  transform: 'translateX(-50%)',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    minHeight: 0,
  },
}));

export default PrimaryBackgroundImage;
