import colors from 'styles/colors';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const RecurlyFormWrapper = styled('div')(({ theme }) => ({
  '.offerLink': {
    fontSize: '1.2rem',
    marginBottom: '1.6rem',
    marginTop: '.3rem',
    span: {
      color: theme.colors.blue.primary,
      cursor: 'pointer',
    },
    textAlign: 'center',
  },
  background: theme.colors.white.primary,
  border: `1px solid ${colors.gray.light}`,
  borderRadius: '0.6rem',
  form: {
    label: {
      fontSize: '1.4rem',
      lineHeight: '2.1rem',
    },
    margin: '0 auto',
    width: '40rem',
  },
  h3: {
    fontSize: '2rem',
    fontWeight: 'bold',
    paddingLeft: '2.1rem',
    paddingRight: '2.1rem',
    textAlign: 'center',
  },
  margin: '0 auto',
  marginTop: '-17rem',
  maxWidth: '68rem',
  padding: '1.6rem',
  position: 'relative',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    form: {
      width: '100%',
    },
    marginTop: '16rem',
    padding: '1.6rem',
    width: '100%',
  },
}));

export default RecurlyFormWrapper;
