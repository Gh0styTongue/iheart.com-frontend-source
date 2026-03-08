import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = { inHero?: boolean };

const SocialLabel = styled('span')<Props>(({ inHero = false, theme }) => ({
  fontSize: inHero ? theme.fonts.size['14'] : theme.fonts.size['16'],
  fontWeight: inHero ? theme.fonts.weight.medium : theme.fonts.weight.regular,
  marginLeft: '0.6rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display: inHero ? 'block' : 'none',
  },
}));

export default SocialLabel;
