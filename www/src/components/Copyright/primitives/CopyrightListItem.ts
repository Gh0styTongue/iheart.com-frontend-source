import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const CopyrightListItem = styled('li')(({ theme }) => ({
  borderRight: `1px solid ${theme.colors.gray['300']}`,
  float: 'left',
  listStyle: 'none',
  padding: '0 1.5rem',
  '&:last-child': {
    borderRight: 'none',
  },
  'a, button': {
    color: theme.colors.gray.medium,
  },
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display: 'inline-block',
    float: 'none',
  },
}));

export default CopyrightListItem;
