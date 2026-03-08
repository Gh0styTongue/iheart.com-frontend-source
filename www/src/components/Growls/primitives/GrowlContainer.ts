import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const GrowlContainer = styled.div(({ theme }) => ({
  background: theme.colors.black.primary,
  border: `1px solid ${theme.colors.white.primary}`,
  marginTop: '1.5rem',
  overflow: 'auto',
  padding: '1.5rem',
  position: 'relative',
  width: '32.5rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    padding: '1rem',
  },
}));

export default GrowlContainer;
