import styled from '@emotion/styled';

const H5 = styled('h5')(({ theme }) => ({
  color: theme.colors.gray['600'],
  fontSize: theme.fonts.size['16'],
  fontWeight: theme.fonts.weight.regular,
  letterSpacing: 0,
  lineHeight: theme.fonts.lineHeight['20'],
  margin: '0.2rem 0',
  textTransform: 'none',
  transition: 'all 300ms ease-in-out',
}));

export default H5;
