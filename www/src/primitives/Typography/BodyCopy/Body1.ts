import styled from '@emotion/styled';

type Props = {
  styleType?: 'dark' | 'light';
  textAlign?: 'left' | 'center';
};

const Body1 = styled('div')<Props>(({
  textAlign = 'left',
  styleType = 'dark',
  theme,
}) => {
  const STYLE_TYPES = {
    dark: {
      color: theme.colors.gray['600'],
    },
    light: {
      color: theme.colors.white.primary,
    },
  };
  return {
    color: STYLE_TYPES[styleType].color,
    fontSize: theme.fonts.size['16'],
    fontWeight: theme.fonts.weight.regular,
    letterSpacing: 0,
    lineHeight: theme.fonts.lineHeight['26'],
    textAlign,
  };
});

export default Body1;
