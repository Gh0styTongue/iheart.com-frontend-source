import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import { iheartLogoTile } from 'constants/assets';

const Logo = styled('div')(({ theme }) => ({
  backgroundImage: `url("${iheartLogoTile}")`,
  backgroundSize: '3.8rem 3.8rem',
  float: 'left',
  height: '3.8rem',
  margin: '6px .8rem 0 7%',
  width: '3.8rem',
  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    marginLeft: '1rem',
  },
}));

export default Logo;
