import type { Interpolation } from '@emotion/react';
import type { Theme } from 'styles/themes/default';

function globalStyles(theme: Theme) {
  return {
    '::selection': {
      background: theme.colors.red.primary,
      color: theme.colors.white.primary,
    },

    '::-moz-selection': {
      background: theme.colors.gray['300'],
      color: theme.colors.white.primary,
    },

    '*, *:before, *:after': {
      boxSizing: 'inherit',
      WebkitFontSmoothing: 'antialiased',
    },

    html: {
      backgroundColor: theme.colors.gray['100'],
      boxSizing: 'border-box',
      fontSize: '10px',
    },

    body: {
      overflowY: 'auto',
      fontFamily: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
      fontSize: '1.6rem',
      margin: '0',
      width: '100%',
    },

    p: {
      margin: 0,
      padding: 0,
    },

    'h1, h2, h3, h4': {
      margin: 0,
    },

    a: {
      textDecoration: 'none',
      color: theme.colors.black.secondary,
      hover: {
        textDecoration: 'underline',
      },
      '&.disabled, &.disabled:hover': {
        color: theme.colors.gray['400'],
      },
    },

    button: {
      fontFamily: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
    },

    img: {
      maxWidth: '100%',
    },

    table: {
      borderSpacing: 0,
      borderCollapse: 'collapse',
    },

    select: {
      transition: 'border-color 0.5s ease',
      '&:focus': {
        border: `1px solid ${theme.colors.gray.medium}`,
      },
    },

    input: {
      backgroundColor: theme.colors.white.primary,
      border: `1px solid ${theme.colors.gray['300']}`,
      borderRadius: '0.5rem',
      display: 'block',
      fontSize: '1.6rem',
      height: '3.7rem',
      lineHeight: 'normal',
      outline: 'none',
      padding: '0 1rem',
      verticalAlign: 'top',
      transition: 'border-color 0.5s ease',
      '&:focus, &:hover': {
        border: `1px solid ${theme.colors.gray.medium}`,
      },

      '&[type="text"], &[type="password"], &[type="email"], &[type="tel"]': {
        width: '100%',
      },
    },
  };
}

export default globalStyles as Interpolation<Theme>;
