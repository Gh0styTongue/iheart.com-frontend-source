import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  noMinHeight?: boolean; // no minimum height to be forced into
};

const Wrapper = styled('div')<Props>(({ noMinHeight = false, theme }) => ({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 8rem - 11rem - 5.6rem - 7rem)', // fullHeight - miniPlayer - adSpace - menuHeight
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    minHeight:
      noMinHeight ? 'auto' : 'calc(100vh - 5rem - 5.8rem - 5.6rem - 6rem)', // fullHeight - miniPlayer - adSpace - menuHeight - section header height
  },
}));

export default Wrapper;
