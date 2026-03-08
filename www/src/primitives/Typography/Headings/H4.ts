import styled from '@emotion/styled';

type Props = {
  display?: 'block' | 'flex';
  styleType?: 'dark' | 'light';
  textAlign?: 'left' | 'center';
};

const H4 = styled('h4')<Props>(({
  display = 'flex',
  styleType = 'dark',
  textAlign = 'left',
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
    alignItems: 'center',
    color: STYLE_TYPES[styleType].color,
    display,
    fontSize: theme.fonts.size['20'],
    fontWeight: theme.fonts.weight.bold,
    letterSpacing: 0,
    lineHeight: theme.fonts.lineHeight['26'],
    margin: '0.4rem 0',
    textAlign,
    transition: 'all 300ms ease-in-out',
  };
});

export default H4;
