import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import PageWrapperComponent from 'primitives/Layout/PageWrapper';
import styled from '@emotion/styled';

const PageWrapper = styled(PageWrapperComponent)(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'space-between',
  margin: '0 auto',
  paddingBottom: '3.6rem',
  paddingTop: '3.6rem',
  [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 0,
  },
}));

export default PageWrapper;
