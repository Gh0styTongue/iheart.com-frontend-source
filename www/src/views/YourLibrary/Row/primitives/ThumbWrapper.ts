import styled from '@emotion/styled';

type Props = {
  isRoundImage?: boolean;
};

const ThumbWrapper = styled('div')<Props>(
  ({ isRoundImage = false, theme }) => ({
    backgroundColor: theme.colors.white.primary,
    borderRadius: '0.6rem',
    boxShadow: '0 0.1rem 0.3rem rgba(0, 0, 0, 0.15)',
    minHeight: '6rem',
    minWidth: '6rem',
    overflow: 'hidden',
    position: 'relative',

    '.image .background': {
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    },

    '.image:after': {
      content: '""',
      height: '100%',
      left: 0,
      position: 'absolute',
      transition: 'background 200ms',
      top: 0,
      width: '100%',
    },

    '.play': {
      opacity: 0,
    },

    '&:hover, &.cy-hover': {
      '.play': {
        opacity: 1,
      },

      '.image::after': {
        background: theme.colors.transparent.dark,
      },
    },

    ...(isRoundImage ?
      {
        borderRadius: '50%',

        '.image img': {
          borderRadius: '50%',
          transform: 'scale(1.15)',
        },
      }
    : {}),
  }),
);

export default ThumbWrapper;
