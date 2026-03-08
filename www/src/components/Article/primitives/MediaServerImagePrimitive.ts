import styled from '@emotion/styled';

type Props = { isLiveThumb?: boolean };

const MediaServerImagePrimitive = styled('span')<Props>(
  ({ isLiveThumb, theme }) => ({
    img: {
      background: isLiveThumb ? theme.colors.white.primary : 'auto',
      border: isLiveThumb ? `1px solid ${theme.colors.gray.primary}` : 'none',
    },
  }),
);

export default MediaServerImagePrimitive;
