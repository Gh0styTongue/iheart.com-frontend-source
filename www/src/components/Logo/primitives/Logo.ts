import NavLink from 'components/NavLink';
import styled from '@emotion/styled';

const Logo = styled(NavLink)({
  height: '4rem',
  width: '12rem',
  '&:before': {
    content: `''`,
    display: 'inline-block',
    height: '100%',
    marginLeft: '-1px',
    verticalAlign: 'middle',
    width: '1px',
  },
});

export default Logo;
