import styled from '@emotion/styled';

const Eyebrow = styled('div')(({ theme }) => ({
  color: theme.colors.gray.medium,
  fontSize: '1.3rem',
  letterSpacing: '0.1rem',
  lineHeight: '1.38rem',
  marginBottom: '1rem',
  textTransform: 'uppercase',
}));

export default Eyebrow;
