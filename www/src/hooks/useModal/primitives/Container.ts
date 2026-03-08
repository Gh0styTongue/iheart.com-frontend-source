import rgbaBuilder from 'styles/helpers/colors/rgbaBuilder';
import styled from '@emotion/styled';

const Container = styled('div')(({ theme }) => ({
  alignItems: 'center',
  background: rgbaBuilder(theme.colors.black.dark, 0.7),
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  left: 0,
  overflow: 'auto',
  position: 'fixed',
  textAlign: 'center',
  top: 0,
  width: '100%',
  zIndex: theme.zIndex.modal,
}));

export default Container;
