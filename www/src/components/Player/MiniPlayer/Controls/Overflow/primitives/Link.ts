import NavLink from 'components/NavLink';
import styled from '@emotion/styled';

const Link = styled(NavLink)(({ disabled = false }) => ({
  color: 'inherit',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  textDecoration: 'none',

  '&:hover': {
    textDecoration: disabled ? 'none' : 'underline',
  },
}));

export default Link;
