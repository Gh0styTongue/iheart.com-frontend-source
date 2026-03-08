import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import NavLink from 'components/NavLink';
import styled from '@emotion/styled';

const DesktopLink = styled(NavLink)(({ theme }) => ({
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display: 'none',
  },
}));

export default DesktopLink;
