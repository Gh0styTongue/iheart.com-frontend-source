import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Button = styled('button')(({ theme }) => ({
  background: 'transparent',
  border: `2px solid ${theme.colors.transparent.light}`,
  borderRadius: '.5rem',
  color: theme.colors.white.primary,
  float: 'right',
  margin: '.8rem',
  marginRight: '7%',
  padding: '.4rem 5%',
  '&:hover': {
    borderColor: theme.colors.white.primary,
  },
  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    fontSize: '1.4rem',
    marginLeft: '0',
    marginRight: '4.1rem',
    padding: '.4rem 1.5rem',
  },
}));

export default Button;
