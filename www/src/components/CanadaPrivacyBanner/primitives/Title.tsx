import H5 from 'primitives/Typography/Headings/H5';
import styled from '@emotion/styled';

export const Title = styled(H5)(({ theme }) => ({
  color: theme.colors.white.primary,
  fontWeight: 700,
}));

export default Title;
