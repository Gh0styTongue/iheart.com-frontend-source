import styled from '@emotion/styled';

const Title = styled('p')(({ theme }) => ({
  borderBottom: `0.1rem solid ${theme.colors.gray.light}`,
  fontSize: '2.2rem',
  fontWeight: 700,
  lineHeight: '2.16rem',
  paddingBottom: '1.5rem',
}));

export default Title;
