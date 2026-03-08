import styled from '@emotion/styled';

type Props = {
  isSdk?: boolean;
  collapseMargin?: boolean;
};

const Label = styled('label')<Props>(
  ({ collapseMargin = false, isSdk = false, theme }) => ({
    '&.placeholderVisible': {
      fontSize: '1.6rem',
      height: 0,
      left: '1rem',
      letterSpacing: 'initial',
      marginBottom: 0,
      opacity: 0.01,
      pointerEvents: 'none',
      top: '1.8rem',
    },
    color: theme.colors.gray.medium,
    display: isSdk ? 'flex' : 'block',
    fontSize: '1.3rem',
    left: 0,
    letterSpacing: '0.1rem',
    lineHeight: '1.38rem',
    marginBottom: collapseMargin ? '0.4rem' : '1.6rem',
    opacity: 1,
    pointerEvents: 'initial',
    position: 'relative',
    textTransform: 'uppercase',
    top: 0,
    transition: 'all 0.2s',
    width: '100%',
  }),
);

export default Label;
