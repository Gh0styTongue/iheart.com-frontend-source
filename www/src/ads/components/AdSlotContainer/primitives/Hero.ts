import styled from '@emotion/styled';

const Hero = styled('div')<{ maxWidthRem: number }>(
  ({ maxWidthRem: _maxWidthRem }) => ({
    boxSizing: 'border-box',
    width: `100%`,
    height: '100%',

    'iframe, div': {
      height: 0,
    },

    img: {
      position: 'absolute',
      height: '100%',
      left: '50vw',
      transform: 'translateX(-50%)',
    },
  }),
);

export default Hero;
