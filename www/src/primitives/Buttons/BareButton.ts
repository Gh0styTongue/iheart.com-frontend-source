import styled from '@emotion/styled';

type Props = {
  className?: string;
  iconOnly?: boolean;
  underline?: boolean;
};

const BareButton = styled('div')<Props>(
  ({ iconOnly = false, underline = false, theme }) => ({
    alignItems: 'center',
    background: theme.colors.transparent.primary,
    border: iconOnly ? `1px solid ${theme.colors.white.primary}` : 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    outline: 'none',

    '> :nth-of-type(2)': {
      marginLeft: '0.5rem',
    },

    ...(underline ?
      {
        '&:hover': {
          textDecoration: 'underline',
        },
      }
    : {}),
  }),
);

export default BareButton;
