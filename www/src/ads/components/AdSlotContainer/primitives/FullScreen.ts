import styled from '@emotion/styled';

const FullScreen = styled('div')<{ maxWidthRem: number }>(
  ({ maxWidthRem }) => ({
    boxSizing: 'border-box',
    width: `${maxWidthRem}rem`,
    height: '100%',
  }),
);

export default FullScreen;
