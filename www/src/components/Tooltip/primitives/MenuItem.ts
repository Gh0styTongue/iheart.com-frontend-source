import styled from '@emotion/styled';

const MenuItem = styled('li')(({ theme }) => ({
  color: theme.colors.gray['600'],
  fontSize: theme.fonts.size['16'],
  padding: '1.2rem 1.6rem',
}));

MenuItem.defaultProps = {
  'aria-label': 'Menu Item',
  role: 'menu-item',
};

export default MenuItem;
