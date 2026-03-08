import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import NavLeft from 'styles/icons/NavLeft';
import styled from '@emotion/styled';

const Icon = styled(NavLeft)(({ theme }) => ({
  cursor: 'pointer',
  display: 'none',
  marginRight: '1.5rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
    display: 'flex',
  },
}));

export default Icon;
