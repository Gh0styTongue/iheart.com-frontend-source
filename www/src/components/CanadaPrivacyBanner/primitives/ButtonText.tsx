import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import P from 'primitives/Typography/BodyCopy/P';
import styled from '@emotion/styled';

export const ButtonText = styled(P)(({ theme }) => ({
  color: theme.colors.white.primary,
  fontSize: '1.4rem',
  fontWeight: 600,
  lineHeight: '1.6rem',
  letterSpacing: '-0.02rem',

  [mediaQueryBuilder(theme.mediaQueries.min.width['1024'])]: {
    fontSize: '1.6rem',
    fontWeight: 500,
    lineHeight: '1.95rem',
  },
}));

export default ButtonText;
