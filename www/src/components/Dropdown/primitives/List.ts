import colors from 'styles/colors';
import styled from '@emotion/styled';

type Props = {
  extendDown?: boolean;
  numChildren: number;
};

const List = styled('ul')<Props>(
  ({ extendDown = false, numChildren = 1, theme }) => ({
    backgroundColor: theme.colors.white.primary,
    borderRadius: '0.5rem',
    boxShadow: `0 0.1rem 1rem ${colors.transparent.secondary}`,
    clear: 'both',
    color: theme.colors.black.primary,
    display: 'flex',
    flexDirection: extendDown ? 'column-reverse' : 'column',
    listStyle: 'none',
    margin: 0,
    overflowY: 'auto',
    padding: numChildren > 1 ? '1.5rem 0' : '0',
    textAlign: 'left',
    width: '100%',

    li: {
      margin: '0.3rem 1.5rem',
    },

    a: {
      cursor: 'pointer',
      whiteSpace: 'nowrap',

      '&:hover': {
        textDecoration: 'underline',
      },
    },

    '.separator': {
      borderBottom: `0.1rem solid ${colors.gray['300']}`,
      display: 'block',
      height: 0,
      margin: 0,
    },
  }),
);

export default List;
