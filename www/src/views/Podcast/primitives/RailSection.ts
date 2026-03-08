import styled from '@emotion/styled';

const RailSection = styled('div')(({ theme }) => ({
  paddingBottom: '2.4rem',

  '&:not(:nth-of-type(2))': {
    paddingTop: '2.4rem',
  },

  '&:not(:last-child)': {
    borderBottom: `0.1rem solid ${theme.colors.gray['300']}`,
    marginBottom: '1.5rem',
  },
}));

export default RailSection;
