import styled from '@emotion/styled';

export const BannerLink = styled('a')(({ theme }) => ({
  color: theme.colors.white.primary,
  textDecoration: 'underline',
}));

export default BannerLink;
