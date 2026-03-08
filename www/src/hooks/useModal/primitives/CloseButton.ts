import styled from '@emotion/styled';

const CloseButton = styled('button')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.colors.white.primary,
  border: `1px solid ${theme.colors.gray['300']}`,
  borderRadius: '100%',
  cursor: 'pointer',
  display: 'flex',
  height: '3rem',
  justifyContent: 'center',
  padding: 0,
  position: 'absolute',
  right: '1rem',
  top: '1rem',
  transition: 'border 300ms ease',
  width: '3rem',

  '&:hover': {
    border: `1px solid ${theme.colors.gray['400']}`,
  },
}));

export default CloseButton;
