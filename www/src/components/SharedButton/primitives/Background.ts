import styled from '@emotion/styled';

const Background = styled('span')({
  backgroundPosition: 'center',
  borderRadius: '99.9rem',
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  transition: 'all 0.4s ease-in-out',
  width: '100%',
  zIndex: 1, // layer below Children component
});

export default Background;
