import styled from '@emotion/styled';

type Props = {
  limit: number;
};

const AlbumTilesWrapper = styled('div')<Props>(({ limit }) => ({
  marginBottom: limit > 3 ? '3rem' : 0,
}));

export default AlbumTilesWrapper;
