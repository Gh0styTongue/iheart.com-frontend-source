import dimensions from 'styles/dimensions';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const FooterWrap = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.gray['100'],
  margin: '2rem auto 3.5rem auto',
  maxWidth: dimensions.pageWidthDesktop,
  padding: '3rem 17.5rem 0',
  position: 'relative',
  transform: 'none',
  width: '100%',
  [mediaQueryBuilder(theme.mediaQueries.max.width['1024'])]: {
    padding: `0 ${dimensions.gutter}`,
  },
}));

export default FooterWrap;
