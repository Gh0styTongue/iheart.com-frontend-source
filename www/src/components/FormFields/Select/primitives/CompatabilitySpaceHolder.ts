import styled from '@emotion/styled';

const CompatabilitySpaceHolder = styled('p')(({ theme }) => ({
  ...theme.mixins.ellipsis,
  bottom: 0,
  color: theme.colors.gray.medium,
  left: 0,
  lineHeight: '3.7rem',
  maxWidth: '100%',
  padding: '0 3rem 0 1.5rem',
  pointerEvents: 'none',
  position: 'absolute',
}));

export default CompatabilitySpaceHolder;
