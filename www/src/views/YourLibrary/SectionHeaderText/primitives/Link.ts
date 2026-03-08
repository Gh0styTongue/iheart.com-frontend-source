import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import NavLinkComponent from 'components/NavLink';
import styled from '@emotion/styled';

type Props = {
  shouldShow?: boolean;
};

const Link = styled(NavLinkComponent)<Props>(
  ({ shouldShow = true, theme }) => ({
    alignItems: 'center',
    display: 'none',
    justifyContent: 'center',

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      display: shouldShow ? 'flex' : 'none',
    },
  }),
);

export default Link;
