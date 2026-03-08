import Logo from 'styles/icons/Logo';
import styled from '@emotion/styled';

type Props = {
  dark?: boolean;
  ignoreDefaultStyles?: boolean;
};

const LogoSVG = styled(Logo, {
  shouldForwardProp: prop => prop !== 'ignoreDefaultStyles' && prop !== 'dark',
})<Props>(({ dark, ignoreDefaultStyles, theme }) =>
  ignoreDefaultStyles ?
    {}
  : {
      display: 'inline-block',
      height: '100%',
      padding: '0.6rem 0 0.8rem',
      svg: {
        height: '3.9rem',
        maxHeight: '100%',
        maxWidth: '100%',
        width: '12.5rem',
      },
      '.iheart-text': {
        fill: dark ? theme.colors.gray.dark : theme.colors.white.primary,
      },
      '.heart': {
        fill: dark ? theme.colors.red['600'] : theme.colors.white.primary,
      },
    },
);

export default LogoSVG;
