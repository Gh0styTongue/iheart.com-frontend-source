import styled from '@emotion/styled';

const TrackNumberContainer = styled('div')(({ theme }) => ({
  alignItems: 'center',
  color: theme.colors.gray.medium,
  display: 'flex',
  fontSize: '1.3rem',
  height: '3rem',
  justifyContent: 'center',
  position: 'relative',
  width: '3rem',
}));

export default TrackNumberContainer;
