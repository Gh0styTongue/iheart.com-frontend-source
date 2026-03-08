import styled from '@emotion/styled';

type Props = {
  'data-src'?: string;
};

const Background = styled('div')<Props>(({ 'data-src': src }) => ({
  ...(src ? { backgroundImage: `url('${src}')` } : {}),
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  display: 'block',
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  transition: 'opacity 500ms ease, visibility 500ms ease',
  width: '100%',
}));

export default Background;
