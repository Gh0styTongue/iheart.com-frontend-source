import styled from '@emotion/styled';

const TrackDescription = styled('div')(({ theme }) => ({
  flex: 1,
  marginLeft: '1.5rem',
  marginRight: '1.5rem',
  ...theme.mixins.ellipsis,
}));

export default TrackDescription;
