import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  noGrowl: boolean;
};

const GrowlContainer = styled.div<Props>(({ noGrowl, theme }) => ({
  position: 'fixed',
  right: '1.5rem',
  bottom: '9rem',
  zIndex: theme.zIndex.growl,
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    bottom: '50%',
    right: '50%',
    pointerEvents: noGrowl ? 'none' : 'auto',
    transform: 'translate(50%, 50%)',
  },
}));

export default GrowlContainer;
