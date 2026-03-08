import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const ControlSet = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',

  '& > button, & > div': {
    margin: '0 1rem',
    padding: 0,

    '&:first-of-type': { marginLeft: 0 },
    '&:last-child': { marginRight: 0 },
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    maxWidth: '40rem',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
    justifyContent: 'flex-start',
    '& > button, & > div': {
      margin: '0 .5rem',

      '& > svg': {
        maxWidth: '3rem',
      },
    },
  },
}));

export default ControlSet;
