import styled from '@emotion/styled';

type Props = { isSearch?: boolean };

const ListItem = styled('li')<Props>(({ theme, isSearch }) => ({
  alignItems: isSearch ? 'center' : 'inherant',
  display: isSearch ? 'flex' : 'block',
  marginLeft: isSearch ? '-2.5rem' : 'auto',
  padding: isSearch ? ' 1rem 2.5rem 2rem' : '0 0 1.5rem',
  '&:first-of-type': {
    marginTop: '-1.5rem',
  },
  '&:last-of-type': {
    paddingBottom: isSearch ? 'auto' : 0,
  },
  '&.selected': {
    backgroundColor: theme.colors.transparent.dark,
    marginLeft: '-1.5rem',
    padding: '1.5rem',
  },
}));

export default ListItem;
