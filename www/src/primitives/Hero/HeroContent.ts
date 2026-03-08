import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const HeroContent = styled.div(({ theme }) => ({
  alignItems: 'flex-start',
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 'auto',
  marginTop: 0,
  width: '50%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['370'])]: {
    width: '55%',
  },
}));

export default HeroContent;
