import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const LinksContainer = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  flex: '0 0 auto',
  flexBasis: '75%',
  maxWidth: '75%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['370'])]: {
    flexBasis: '100%',
    maxWidth: '100%',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    flexBasis: 'initial',
    maxWidth: 'none',
    marginLeft: '-1.5rem',
    width: '100%',
  },
}));

export default LinksContainer;
