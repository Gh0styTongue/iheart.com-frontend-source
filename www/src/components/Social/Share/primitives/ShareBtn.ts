import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const ShareBtn = styled('a')(({ theme }) => ({
  '& > i': {
    color: theme.colors.gray.medium,
    fontSize: '2rem',

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      fontSize: '2.3rem',
      lineHeight: '1.5rem',
    },
  },

  '&:hover': {
    cursor: 'pointer',
    textDecoration: 'none',
  },

  '[data-modal-name="fullscreen-player"] &': {
    i: {
      color: theme.colors.white.primary,
    },

    display: 'inline-block',
    opacity: 1,
    position: 'absolute',
    right: 0,
    textDecoration: 'none',
    top: 0,
  },

  alignSelf: 'center',
  marginLeft: '2rem',
  whiteSpace: 'nowrap',
}));

export default ShareBtn;
