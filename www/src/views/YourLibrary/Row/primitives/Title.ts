import styled from '@emotion/styled';

type Props = { newEpisodeCount?: number };

const Title = styled('div')<Props>(({ newEpisodeCount, theme }) => ({
  color: theme.colors.gray['600'],
  fontSize: theme.fonts.size['16'],
  lineHeight: theme.fonts.lineHeight['20'],
  width: newEpisodeCount ? '60%' : '100%',
}));

export default Title;
