import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroContainer = styled('section')(({ theme }) => ({
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  transition: 'top 0.2s ease-out',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    zIndex: 2,
  },
}));

export default HeroContainer;
