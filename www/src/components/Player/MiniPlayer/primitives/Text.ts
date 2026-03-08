import styled from '@emotion/styled';

const Container = styled('div')(({ theme }) => ({
  padding: '1rem',
  width: 'calc(100% - 7.5rem)',

  a: {
    color: 'inherit',
  },

  p: {
    ...theme.mixins.ellipsis,
    color: theme.colors.gray[600],

    '&:nth-of-type(1), &:nth-of-type(3)': {
      fontSize: theme.fonts.size[12],
    },

    '&:nth-of-type(2)': {
      fontSize: theme.fonts.size[16],
    },
  },
}));

export default Container;
