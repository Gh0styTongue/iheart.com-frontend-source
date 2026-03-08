import styled from '@emotion/styled';

const CheckBoxText = styled('span')(({ theme }) => ({
  color: theme.colors.gray.medium,
  display: 'inline-block',
  fontSize: '1.6rem',
  fontWeight: 400,
  lineHeight: '2rem',
  letterSpacing: '-0.02rem',
  maxWidth: '83%',
  verticalAlign: 'middle',
  zoom: '1',
}));

export default CheckBoxText;
