import styled from '@emotion/styled';

const ThumbButton = styled('button')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.colors.transparent.primary,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  jutstifyContent: 'center',
  marginRight: '0.75rem',
  opacity: 0.8,
  outline: 'none',

  '&:hover': {
    opacity: 1,
  },
}));

export default ThumbButton;
