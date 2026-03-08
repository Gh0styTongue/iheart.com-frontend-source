import Body2 from 'primitives/Typography/BodyCopy/Body2';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

export const Body = styled(Body2)(({ theme }) => ({
  color: theme.colors.white.primary,
  lineHeight: '1.8rem',
  width: '100%',
  fontWeight: 400,

  [mediaQueryBuilder(theme.mediaQueries.min.width['1024'])]: {
    letterSpacing: '-0.02rem',
  },
}));

export default Body;
