import styled from '@emotion/styled';

type Props = {
  titleText?: string | boolean;
};

const TileSubtitle = styled('div')<Props>(({ titleText = true, theme }) => ({
  a: {
    color: theme.colors.gray.medium,
  },
  color: titleText ? theme.colors.gray.medium : theme.colors.gray.dark,
  fontSize: titleText ? theme.fonts.size['14'] : theme.fonts.size.small,
  lineHeight:
    titleText ? theme.fonts.lineHeight.xsmall : theme.fonts.lineHeight.small,
  marginTop: '0.5rem',
}));

export default TileSubtitle;
