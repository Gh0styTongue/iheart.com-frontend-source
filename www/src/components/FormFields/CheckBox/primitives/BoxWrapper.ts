import styled from '@emotion/styled';

const BoxWrapper = styled('span')(({ theme }) => ({
  backgroundColor: theme.colors.white.primary,
  border: '1px solid transparent',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: '1.6rem',
  height: '3.2rem',
  lineHeight: 'normal',
  marginRight: '1rem',
  outline: 'none',
  padding: '0',
  position: 'relative',
  transition: 'all 0.1s ease-in-out',
  transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.3, 1)',
  verticalAlign: 'middle',
  width: '3.2rem',
  zoom: '1',
}));

export default BoxWrapper;
