import styled from '@emotion/styled';

const Description = styled('div')(({ theme }) => ({
  color: theme.colors.gray['400'],
  fontSize: theme.fonts.size.xsmall,
  a: { color: theme.colors.gray['400'] },
}));

export default Description;
