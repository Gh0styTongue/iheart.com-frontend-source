import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import Truncate from 'components/Truncate';

export const Title = styled(Truncate)(({ theme }) => ({
  fontSize: '3.6rem',
  fontWeight: 700,
  lineHeight: 'initial',
  marginBottom: '0.5rem',
  marginRight: '0.5rem',
  minWidth: '15rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    fontSize: theme.fonts.size['16'],
    minWidth: '5rem',
  },
}));

export default Title;
