import styled from '@emotion/styled';

type Props = {
  applyMobileStyles: boolean;
  hideCount: boolean;
};

const Badge = styled('div')<Props>(
  ({ applyMobileStyles, hideCount = false, theme }) => ({
    background: theme.colors.blueNew['600'],
    borderRadius: '4px',
    color: theme.colors.white.primary,
    fontSize: '1.5rem',
    fontWeight: theme.fonts.weight.medium,
    padding: '0 .5rem',
    position: 'absolute',
    right: '.5rem',
    top: '.45rem',
    zIndex: theme.zIndex.feedback,

    ...(applyMobileStyles ?
      {
        marginBottom: '.25rem',
        right: '2.5rem',
        top: 'inherit',
      }
    : {}),

    ...(hideCount ?
      {
        display: 'inline-block',
        fontSize: '1.25rem',
        marginRight: '1rem',
        position: 'initial',
      }
    : {}),
  }),
);

export default Badge;
