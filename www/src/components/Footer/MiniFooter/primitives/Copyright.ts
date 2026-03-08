import CopyrightComponent from 'components/Copyright';
import styled from '@emotion/styled';

const Copyright = styled(CopyrightComponent)(({ theme }) => ({
  borderTop: `1px ${theme.colors.gray.medium} solid`,
  padding: '1rem 0',
}));

export default Copyright;
