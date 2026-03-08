import styled from '@emotion/styled';

const DateText = styled('div')(({ theme }) => ({
  color: '#b9b9b9',
  fontSize: theme.fonts.size.xsmall,
  letterSpacing: '0.02em',
  lineHeight: theme.fonts.lineHeight.xsmall,
  marginTop: '1rem',
  textAlign: 'center',
}));

export default DateText;
