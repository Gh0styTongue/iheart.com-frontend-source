import Field from 'components/FormFields/primitives/Field';
import styled from '@emotion/styled';

const CheckBoxInput = styled(Field)({
  borderRadius: '0.5rem',
  boxSizing: 'border-box',
  display: 'block',
  height: '4.5rem',
  left: 0,
  opacity: 0,
  padding: 0,
  position: 'absolute',
  top: 0,
  verticalAlign: 'top',
  width: '100%',
  zIndex: 1,
});

export default CheckBoxInput;
