import styled from '@emotion/styled';

const MenuList = styled('ul')({
  listStyleType: 'none',
  margin: 0,
  padding: 0,
});

MenuList.defaultProps = {
  'aria-label': 'Menu List',
  role: 'menu',
};

export default MenuList;
