import styled from '@emotion/styled';

const RightRail = styled('div')<{ maxWidthRem: number }>(({ maxWidthRem }) => ({
  boxSizing: 'border-box',
  width: `${maxWidthRem}rem`,
  height: 'auto',
  marginBottom: '30px',
}));

export default RightRail;
