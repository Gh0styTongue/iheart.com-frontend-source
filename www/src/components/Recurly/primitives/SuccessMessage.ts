import styled from '@emotion/styled';

const ErrorMessage = styled('div')(({ theme }) => ({
  background: theme.colors.green['200'],
  color: theme.colors.white.primary,
  margin: '1rem 0',
  padding: '2rem',
}));

export default ErrorMessage;
