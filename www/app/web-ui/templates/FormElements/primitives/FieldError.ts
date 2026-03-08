import styled from '@emotion/styled';

type Props = {
  visible?: boolean;
};

const FieldError = styled('div')<Props>(({ theme, visible = false }) => ({
  alignItems: 'center',
  justifyContent: 'flex-start',
  display: visible ? 'flex' : 'none',
  flexDirection: 'row',
  color: '#A82700',
  fontSize: theme.fonts.size['12'],
  lineHeight: theme.fonts.lineHeight['16'],
  margin: '0.4rem 0 0.4rem',

  '& svg': {
    marginRight: '0.4rem',
  },
}));

export default FieldError;
