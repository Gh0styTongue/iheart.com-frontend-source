import styled from '@emotion/styled';

type Props = {
  color?: string;
};

const Progress = styled('div')<Props>(({ color }) => ({
  backgroundColor: color,
  borderRadius: '0.1rem',
  cursor: 'pointer',
  height: '0.2rem',
  left: '0',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '100%',

  '& > *': {
    left: '100%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
  },
}));

export default Progress;
