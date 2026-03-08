import styled from '@emotion/styled';

type Props = {
  readonly?: boolean;
};

const Container = styled('div')<Props>(({ readonly = false }) => ({
  cursor: readonly ? 'default' : 'pointer',
  flexGrow: 1,
  height: '100%',
  margin: '0 0.5rem',
  position: 'relative',
  userSelect: 'none',
}));

export default Container;
