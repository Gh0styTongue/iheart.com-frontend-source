import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import TileThumb from './TileThumb';

const TileDropdown = styled('div')(({ theme }) => ({
  '& > button': {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    svg: {
      display: 'inline-block',
      verticalAlign: 'middle',
    },
    width: '100%',
    ':hover': {
      cursor: 'pointer',
    },
  },

  [`${TileThumb.toString()}:hover &`]: {
    '+ div .image': {
      '&:after': {
        background: theme.colors.transparent.dark,
      },
    },

    border: `0.1rem solid ${theme.colors.white.primary}`,
    opacity: 1,

    path: {
      fill: theme.colors.white.primary,
    },
  },

  backgroundColor: theme.colors.transparent.primary,
  borderRadius: '100%',
  bottom: '1rem',
  color: theme.colors.white.primary,
  height: '4rem',
  opacity: 0,
  position: 'absolute',
  right: '1rem',
  width: '4rem',
  zIndex: 1,

  [mediaQueryBuilder(theme.mediaQueries.max.width['1160'])]: {
    bottom: '1.5rem',
    right: '1.5rem',
  },
  [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
    opacity: 1,
  },
}));

export default TileDropdown;
