import styled from '@emotion/styled';

type Props = {
  color: string;
};

const Handle = styled('div')<Props>(({ color }) => ({
  backgroundColor: color,
  borderRadius: '0.6rem',
  height: '1.2rem',
  width: '1.2rem',
}));

export default Handle;
