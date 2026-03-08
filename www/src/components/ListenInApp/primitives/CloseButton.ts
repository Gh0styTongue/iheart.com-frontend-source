import styled from '@emotion/styled';

const CloseButton = styled('div')(({ theme }) => ({
  color: theme.colors.white.primary,
  cursor: 'pointer',
  fontSize: '1.1rem',
  opacity: '.7',
  position: 'absolute',
  right: '1rem',
  top: '1rem',
  '&:hover': {
    opacity: 1,
  },
}));

export default CloseButton;
