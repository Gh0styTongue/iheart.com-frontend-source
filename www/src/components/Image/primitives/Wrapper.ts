import styled from '@emotion/styled';

type Props = {
  aspectRatio: number;
  loaded: boolean;
};

const Wrapper = styled('div')<Props>(({ aspectRatio, loaded = false }) => ({
  height: '100%',
  opacity: loaded ? 1 : 0,
  position: 'relative',
  transition: 'opacity 300ms ease',

  '& > div': {
    paddingTop: aspectRatio > 0 ? `${(1 / aspectRatio) * 100}%` : undefined,
  },
}));

export default Wrapper;
