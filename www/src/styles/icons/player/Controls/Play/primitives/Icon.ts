import styled from '@emotion/styled';

type Props = {
  size?: string;
};

const Icon = styled('svg')<Props>(({ size = '4rem', theme }) => ({
  height: size,
  width: size,
  fill: theme.colors.red.default,
  '&:hover': {
    fill: theme.colors.red.tertiary,
  },
  '&:active': {
    fill: theme.colors.red.primary,
  },
}));

export default Icon;
