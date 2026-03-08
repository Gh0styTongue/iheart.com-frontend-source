import Progress from './Progress';
import styled from '@emotion/styled';

const Track = styled(Progress)(({ theme }) => ({
  backgroundColor: theme.colors.gray[300],
}));

export default Track;
