import styled from '@emotion/styled';

type Props = {
  color?: string;
};

const Time = styled('div')<Props>(({ color, theme }) => ({
  color: color || theme.colors.gray[600],
  fontSize: theme.fonts.size[12],
}));

export default Time;
