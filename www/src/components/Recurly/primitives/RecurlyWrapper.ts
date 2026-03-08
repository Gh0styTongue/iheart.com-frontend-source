import dimensions from 'styles/dimensions';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const RecurlyWrapper = styled('div')(({ theme }) => ({
  margin: '10rem auto',
  maxWidth: dimensions.pageWidthDesktop,
  padding: '0px 17.5rem',
  position: 'relative',
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    padding: '1rem',
    width: '100%',
  },
}));

export default RecurlyWrapper;
