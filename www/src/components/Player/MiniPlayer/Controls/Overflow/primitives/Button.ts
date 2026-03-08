import Link from './Link';
import styled from '@emotion/styled';

const Button = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.transparent.primary,
  border: 'none',
  padding: 0,
  fontSize: 'inherit',
}));

export default Link.withComponent(Button);
