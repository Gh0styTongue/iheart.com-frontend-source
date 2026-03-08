import styled from '@emotion/styled';

const InputSelectValue = styled('p')(({ theme }) => ({
  ...theme.mixins.ellipsis,
  height: '3.7rem',
  left: '0',
  lineHeight: 'calc(3.2rem - 4px)',
  maxWidth: '100%',
  padding: '0 1.5rem',
  paddingRight: '3rem',
  position: 'absolute',
  top: '0',
}));

export default InputSelectValue;
