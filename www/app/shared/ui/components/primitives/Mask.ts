import styled from '@emotion/styled';

const Hover = styled('div')(({ theme }) => ({
  background: theme.colors.transparent.dark,
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
}));

export default Hover;
