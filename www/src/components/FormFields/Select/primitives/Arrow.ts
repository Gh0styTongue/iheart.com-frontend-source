import Icon from 'components/Icon/Icon';
import styled from '@emotion/styled';

const Arrow = styled(Icon)(({ theme }) => ({
  bottom: '0.8rem',
  lineHeight: '1em',
  padding: '0 1.5rem',
  position: 'absolute',
  right: '0',
  'svg *': {
    fill: theme.colors.black.secondary,
  },
}));

export default Arrow;
