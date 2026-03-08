import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import SVGlogo from 'components/Logo/SVGlogo';

const Logo = styled(SVGlogo)(({ theme }) => ({
  height: 'auto',
  position: 'relative',
  top: 0,

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display: 'none',
  },
}));

export default Logo;
