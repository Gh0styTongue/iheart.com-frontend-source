import styled from '@emotion/styled';

const Header = styled('div')<{ maxWidthRem: number }>(({ maxWidthRem }) => ({
  boxSizing: 'border-box',
  width: `${maxWidthRem}rem`,
  height: 'auto',
  textAlign: 'center',
  margin: 'auto',
}));

export default Header;
