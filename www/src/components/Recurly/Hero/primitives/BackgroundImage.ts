import styled from '@emotion/styled';

const BackgroundImage = styled('img')({
  animation: 'fades-in 1s',
  height: '100%',
  left: '50%',
  maxWidth: 'none',
  position: 'absolute',
  objectFit: 'cover',
  transform: 'translateX(-50%)',
  width: '100%',
});

export default BackgroundImage;
