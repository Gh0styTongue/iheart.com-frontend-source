import styled from '@emotion/styled';

const Subheading = styled('p')(({ theme }) => ({
  color: theme.colors.gray['400'],
  fontSize: theme.fonts.size['16'],
  marginBottom: '3rem',
}));

export default Subheading;
