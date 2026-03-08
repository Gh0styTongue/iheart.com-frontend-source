import styled from '@emotion/styled';

type Props = {
  visible?: boolean;
};

const Error = styled('p')<Props>(({ theme, visible = false }) => ({
  background: theme.colors.black.primary,
  borderRadius: '0.3rem',
  color: theme.colors.white.primary,
  display: 'block',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  height: visible ? 'initial' : '0',
  lineHeight: '1.755rem',
  margin: visible ? `${theme.dimensions.gutter} 0 1rem 0` : 0,
  padding: visible ? '1.4rem 1rem' : '0',
  position: 'relative',
  textAlign: 'center',
  transition: 'all 0.2s',
  width: '100%',
}));

export const AriaError = styled('p')(() => ({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  position: 'absolute',
  width: '1px',
}));

export default Error;
