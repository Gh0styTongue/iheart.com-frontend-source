import styled from '@emotion/styled';

const MenuButton = styled('button')(({ theme }) => ({
  '&:focus': {
    outline: 'none',
  },

  '&:hover': {
    textDecoration: 'underline',
  },

  backgroundColor: theme.colors.transparent.primary,
  border: 'none',
  fontSize: theme.fonts.size['16'],
  margin: 0,
  padding: 0,
}));

export default MenuButton;
