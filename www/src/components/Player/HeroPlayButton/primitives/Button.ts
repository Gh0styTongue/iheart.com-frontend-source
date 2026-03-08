import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  newHero: boolean;
};

const Button = styled('button')<Props>(({ newHero = false, theme }) => {
  const widthSize = newHero ? '599' : '768';
  return {
    backgroundColor: theme.colors.white.primary,
    borderRadius: '50%',
    cursor: 'pointer',
    height: theme.dimensions.heroPlayButton,
    width: theme.dimensions.heroPlayButton,
    margin: `${theme.dimensions.gutter} ${theme.dimensions.gutter} ${theme.dimensions.gutter} 0`,
    border: 0,
    padding: 0,
    position: 'relative',

    [mediaQueryBuilder(theme.mediaQueries.max.width[widthSize])]: {
      bottom: newHero ? '-2.5rem' : '-2rem',
      height: theme.dimensions.heroPlayButtonMobile,
      margin: 0,
      position: 'absolute',
      right: '1.5rem',
      width: theme.dimensions.heroPlayButtonMobile,
      zIndex: theme.zIndex.heroPlayButton,

      '& svg': {
        height: theme.dimensions.heroPlayButtonMobile,
        width: theme.dimensions.heroPlayButtonMobile,
        bottom: 0,
        position: 'absolute',
        right: 0,
      },
    },
  };
});

Button.defaultProps = { role: 'button' };

export default Button;
