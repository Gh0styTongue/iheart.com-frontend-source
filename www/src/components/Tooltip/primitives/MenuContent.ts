import styled from '@emotion/styled';
import { ANCHOR } from 'components/Tooltip/constants';

function buildDataSelector(x: string, y: string): string {
  return `[data-anchor-x="${x}"][data-anchor-y="${y}"] &`;
}

const MenuContent = styled('div')(({ theme }) => ({
  '&::after': {
    backgroundColor: theme.colors.white.primary,
    display: 'block',
    height: '1rem',
    position: 'absolute',
    transformOrigin: 'center',
    width: '1rem',
  },

  '&:focus': {
    outline: 'none',
  },

  [buildDataSelector(ANCHOR.X.CENTER, ANCHOR.Y.BOTTOM)]: {
    '&::after': {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.10)',
      content: `''`,
      left: '75%',
      top: '100%',
      transform: 'translate3d(-50%, -0.5rem, 0) rotate(45deg)',
    },

    transform: 'translate3d(-75%, calc(-100% - 0.75rem), 0)',
  },

  [buildDataSelector(ANCHOR.X.CENTER, ANCHOR.Y.TOP)]: {
    '&::after': {
      boxShadow: '-1px -1px 2px rgba(0, 0, 0, 0.10)',
      content: `''`,
      left: '75%',
      top: 0,
      transform: 'translate3d(-50%, -0.5rem, 0) rotate(45deg)',
    },

    transform: 'translate3d(-75%, 1.5rem, 0)',
  },

  [buildDataSelector(ANCHOR.X.LEFT, ANCHOR.Y.BOTTOM)]: {
    transform: 'translate3d(0, -100%, 0)',
  },

  [buildDataSelector(ANCHOR.X.LEFT, ANCHOR.Y.TOP)]: {
    transform: 'translate3d(0, 0, 0)',
  },

  [buildDataSelector(ANCHOR.X.RIGHT, ANCHOR.Y.BOTTOM)]: {
    transform: 'translate3d(-100%, -100%, 0)',
  },

  [buildDataSelector(ANCHOR.X.RIGHT, ANCHOR.Y.TOP)]: {
    transform: 'translate3d(-100%, 0, 0)',
  },

  backgroundColor: theme.colors.white.primary,
  border: 'none',
  borderRadius: '3px',
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.15)',
  minWidth: '15rem',
  pointerEvents: 'auto',
  position: 'relative',
  textAlign: 'left',
}));

export default MenuContent;
