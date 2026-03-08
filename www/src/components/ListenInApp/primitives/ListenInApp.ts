import styled from '@emotion/styled';

const ListenInApp = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.black.dark,
  height: '5rem',
  left: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  transition: 'top 0.2s ease-out',
  zIndex: 115,
}));

export default ListenInApp;
