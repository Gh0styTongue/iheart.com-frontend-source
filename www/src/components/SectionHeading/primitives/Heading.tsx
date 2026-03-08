import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Heading = styled('h1')(({ theme }) => ({
  fontSize: theme.fonts.size['18'],
  fontWeight: theme.fonts.weight.bold,
  lineHeight: theme.fonts.lineHeight['30'],
  [mediaQueryBuilder(theme.mediaQueries.min.width['768'])]: {
    fontSize: theme.fonts.size['24'],
  },
}));

export default Heading;
