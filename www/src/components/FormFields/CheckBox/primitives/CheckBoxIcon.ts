import Icon from 'components/Icon/Icon';
import styled from '@emotion/styled';

type Props = {
  active: boolean;
};

const CheckBoxIcon = styled(Icon)<Props>(({ active, theme }) => ({
  display: active ? 'block' : 'none',
  fontSize: '2rem',
  height: '100%',
  lineHeight: '3.5rem',
  textAlign: 'center',
  width: '100%',

  'svg *': {
    fill: theme.colors.blueNew['600'],
  },
}));

export default CheckBoxIcon;
