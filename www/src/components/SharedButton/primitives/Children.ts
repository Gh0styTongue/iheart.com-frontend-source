import styled from '@emotion/styled';

const Children = styled('div')({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 2, // layer above Background component
});

export default Children;
