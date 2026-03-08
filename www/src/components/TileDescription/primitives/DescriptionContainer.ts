import styled from '@emotion/styled';
import Truncate from 'components/Truncate';

const DescriptionContainer = styled(Truncate)(({ theme }) => ({
  alignItems: 'center',
  color: theme.colors.gray.medium,
  fontSize: theme.fonts.size.xsmall,
  lineHeight: theme.fonts.lineHeight.xsmall,
  margin: 0,
  padding: 0,
}));

export default DescriptionContainer;
