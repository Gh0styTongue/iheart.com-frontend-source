import styled from '@emotion/styled';

type Props = {
  hasBackLink?: boolean;
  hasMobileBottomLink?: boolean;
  noWrap?: boolean;
};

const SectionHeader = styled('h3')<Props>(
  ({ hasBackLink, hasMobileBottomLink, noWrap, theme }) => ({
    fontSize: theme.fonts.size['22'],
    fontWeight: 'bold',
    lineHeight: theme.fonts.lineHeight['24'],
    overflow: noWrap ? 'visible' : 'hidden',
    paddingBottom: '1.5rem',
    paddingLeft: hasBackLink ? '2rem' : 0,
    position: hasMobileBottomLink ? 'initial' : 'relative',
    textOverflow: noWrap ? 'inherit' : 'ellipsis',
    width: '100%',
    whiteSpace: noWrap ? 'normal' : 'nowrap',
    a: {
      '&:hover': { textDecoration: 'none' },
    },
  }),
);

export default SectionHeader;
