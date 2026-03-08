import styled from '@emotion/styled';

const ErrorMessage = styled('div')(({ theme }) => ({
  background: theme.colors.red.primary,
  color: theme.colors.white.primary,
  margin: '1rem 0',
  padding: '2rem',
  scrollMarginTop: theme.dimensions.headerHeight,
  scrollSnapMarginTop: theme.dimensions.headerHeight,
  '&:focus': {
    outline: 'none',
  },
}));

export default ErrorMessage;
