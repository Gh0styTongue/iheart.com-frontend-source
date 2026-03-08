import styled from '@emotion/styled';

type Props = {
  isRoundImage?: boolean;
  isWideTile?: boolean;
  mobile?: boolean;
  noHoverEffect?: boolean;
};

const TileThumb = styled('div')<Props>(
  ({
    mobile = false,
    isRoundImage = false,
    isWideTile = false,
    noHoverEffect = false,
    theme,
  }) => ({
    borderRadius: isWideTile ? '0.5rem' : '0.8rem',
    boxShadow: '0 0.1rem 0.3rem rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    position: 'relative',

    img: {
      borderRadius: 0,
    },

    '.image:after, .image:before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      transition: 'background 200ms',
    },

    '.image:before': {
      zIndex: 1,
      backgroundImage:
        mobile ?
          'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0, 0, 0, 0) 65%, rgba(0,0,0,0.5) 100%)'
        : 'none',
    },

    'button.play': {
      opacity: 0,
      transition: 'opacity .3s',
      zIndex: 2,

      '&:hover': {
        borderColor: theme.colors.transparent.medium,

        '+ .image:hover::after': {
          background: theme.colors.transparent.dark,
        },
      },
    },

    '.tile-dropdown': {
      opacity: mobile ? 1 : 0,
    },

    '&:hover, &.cy-hover': {
      '.play, .tile-dropdown': {
        opacity: 1,
      },

      '.image::after': {
        background: noHoverEffect ? 'none' : theme.colors.transparent.dark,
      },
    },

    '.image img': {
      border: 'none',
      borderRadius: isWideTile ? '0.5rem' : '0.8rem',
    },

    ...(isRoundImage ?
      {
        borderRadius: '50%',

        '.image img': {
          borderRadius: '50%',
        },
      }
    : {}),
  }),
);

export default TileThumb;
