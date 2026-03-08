import styled from '@emotion/styled';

const BaseSideBurn = styled('div')({
  height: '100%',
  position: 'sticky',
  width: '14.5rem',
  top: 0,
  zIndex: 108,
  img: {
    width: '100%',
  },
  '& div': {
    height: 0,
  },
});

export const LeftSideBurn = styled(BaseSideBurn)<{ maxWidthRem: number }>({
  float: 'left',
});

export const RightSideBurn = styled(BaseSideBurn)<{ maxWidthRem: number }>({
  float: 'right',
});
