import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const Container = styled('div')(({ theme }) => ({
  display: 'flex',

  button: {
    '&:first-of-type': { marginRight: '0.8rem' },
    '&:last-of-type': { marginLeft: '0.8rem' },
  },

  '&.fullscreen-thumbs': {
    justifyContent: 'center',
    marginBottom: '2rem',
  },

  [mediaQueryBuilder(theme.mediaQueries.max.width['400'])]: {
    '&.fullscreen-thumbs': {
      marginTop: '-5.5rem',
      justifyContent: 'flex-end',
    },
  },
}));

export default Container;
