import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroPlaySection = styled.div(({ theme }) => ({
  display: 'flex',
  width: '100%',
  [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
    marginTop: '0.7rem',
  },
}));

export default HeroPlaySection;
