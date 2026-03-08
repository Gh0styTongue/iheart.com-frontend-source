import FilledButton from 'primitives/Buttons/FilledButton';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

export const Button = styled(FilledButton)(({ theme }) => ({
  alignSelf: 'end',
  height: 'auto',
  padding: '0.8rem 1.6rem',

  '&:focus-visible': { outline: '2px solid red', borderRadius: '100px' },

  [mediaQueryBuilder(theme.mediaQueries.min.width['1024'])]: {
    alignSelf: 'center',
    minWidth: '19rem',
    padding: '1.2rem 2.4rem',
  },
}));

export default Button;
