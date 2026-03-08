import MediaServerImage from 'components/MediaServerImage';
import styled from '@emotion/styled';

const HolidayHatLogo = styled(MediaServerImage)({
  display: 'inline-block',
  maxHeight: '100%',
  maxWidth: '100%',
  verticalAlign: 'middle',
  width: '100%',

  img: {
    '&:not([src])': {
      display: 'none',
    },
  },
});

export default HolidayHatLogo;
