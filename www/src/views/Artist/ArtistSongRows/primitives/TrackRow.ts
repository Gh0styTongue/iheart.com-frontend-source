import styled from '@emotion/styled';

type Props = {
  alignTrackRow?: string;
  disabled?: boolean;
};

const TrackRow = styled('li')<Props>(
  ({ alignTrackRow = 'center', disabled = false }) => ({
    alignItems: alignTrackRow,
    display: 'flex',
    marginBottom: '2rem',
    opacity: disabled ? 0.5 : 1,
    padding: 0,
    pointerEvents: disabled ? 'none' : 'auto',
  }),
);

export default TrackRow;
