import colors from 'styles/colors';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const TermsofUseText = styled('div')(({ theme }) => ({
  a: {
    fontWeight: 'bold',
  },
  background: colors.gray['100'],
  fontSize: '1.3rem',
  marginTop: '2rem',
  padding: '2rem',
  position: 'relative',
  textAlign: 'center',
  marginLeft: '2rem',
  marginRight: '2rem',
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    left: '0',
    width: '100%',
    marginLeft: 0,
    marginRight: 0,
  },
}));

export default TermsofUseText;
