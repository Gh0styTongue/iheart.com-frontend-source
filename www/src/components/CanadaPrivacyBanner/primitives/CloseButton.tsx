import styled from '@emotion/styled';

export const CloseButton = styled('button')(() => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.6rem',
  position: 'absolute',
  right: 0,
  top: 0,
  width: 'min-content',
}));

export default CloseButton;
