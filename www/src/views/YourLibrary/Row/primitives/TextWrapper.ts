import NavLink from 'components/NavLink';
import styled from '@emotion/styled';

const TextWrapper = styled(NavLink)({
  alignItems: 'flex-start',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: 'calc(100% - 6rem - 6rem - 1.2rem)', // 100% - thumbWidth - navRightWidth - spacingWidth
});

export default TextWrapper;
