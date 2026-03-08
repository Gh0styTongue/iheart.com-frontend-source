import mediaQueries from 'styles/mediaQueries';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const UpgradeWrap = styled('div')({
  marginBottom: '8rem',
  [mediaQueryBuilder(mediaQueries.max.width['768'])]: {
    marginTop: '0',
  },
});

export default UpgradeWrap;
