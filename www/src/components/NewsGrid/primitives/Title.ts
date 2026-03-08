import styled from '@emotion/styled';
import Truncate from 'components/Truncate';

const Title = styled(Truncate)(({ theme }) => ({
  display: 'block',
  fontSize: theme.fonts.size.small,
  fontWeight: theme.fonts.weight.bold,
  lineHeight: theme.fonts.lineHeight.small,
  marginTop: '1rem',
  textAlign: 'center',
}));

export default Title;
