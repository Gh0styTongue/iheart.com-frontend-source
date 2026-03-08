import styled from '@emotion/styled';

const NoPaymentWrap = styled('div')(({ theme }) => ({
  background: theme.colors.gray.medium,
  borderRadius: '.5rem',
  color: theme.colors.white.primary,
  margin: '1rem 0',
  padding: '1.5rem',
}));

export default NoPaymentWrap;
