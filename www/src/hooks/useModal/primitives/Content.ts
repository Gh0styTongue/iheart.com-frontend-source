import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import TileContainer from 'components/Tile/primitives/TileContainer';
import { keyframes } from '@emotion/react';
import type { Theme } from 'styles/themes/default';

type Props = {
  styles?: Record<string, any> | ((a: Theme) => Record<string, any>);
};
const open = keyframes({
  from: {
    opacity: 0,
    transform: 'scale3d(1.1, 1.1, 1)',
  },
  to: {
    opacity: 1,
    transform: 'scale3d(1, 1, 1)',
  },
});

const Content = styled('div')<Props>(({ styles = {}, theme }) => ({
  animationDuration: '300ms',
  animationFillMode: 'forwards',
  animationName: open,
  backgroundColor: theme.colors.white.primary,
  borderRadius: '0.3rem',
  margin: 0,
  maxHeight: '100vh',
  maxWidth: '60rem',
  minWidth: '29rem',
  overflowY: 'scroll',
  padding: '3rem',
  position: 'relative',
  width: '100%',
  zIndex: 1,
  ...(typeof styles === 'function' ? styles(theme) : styles),
  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    [TileContainer.toString()]: {
      maxWidth: '100%',
    },
  },
}));

export default Content;
