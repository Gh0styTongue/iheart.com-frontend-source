import styled from '@emotion/styled';

type Props = {
  underline?: boolean;
};

const LinkButton = styled('button')<Props>(({ theme, underline = true }) => ({
  border: 'none',
  backgroundImage: 'none',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  color: theme.colors.black.secondary,
  cursor: 'pointer',
  fontSize: 'inherit',
  padding: 0,
  textDecoration: 'inherit',
  width: 'max-content',

  '&:hover, &:focus': {
    textDecoration: underline ? 'underline' : 'inherit',
  },
}));

export default LinkButton;
