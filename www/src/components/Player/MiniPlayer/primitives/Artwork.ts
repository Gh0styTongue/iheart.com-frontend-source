import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import MediaServerImage from 'components/MediaServerImage';
import styled from '@emotion/styled';

const Artwork = styled(MediaServerImage)(({ theme }) => ({
  display: 'inline-block',
  height: '7.5rem',
  width: '7.5rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width[768])]: {
    display: 'none',
  },
}));

export default Artwork;
