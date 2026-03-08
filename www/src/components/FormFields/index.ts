import CheckBox from './CheckBox/CheckBox';
import FieldProvider from './FieldProvider/FieldProvider';
import Input from './Input/Input';
import PropTypes from 'prop-types';
import Select from './Select/Select';

const WrappedInput = FieldProvider(PropTypes.string)(Input);

const WrappedSelect = FieldProvider(
  PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
  }),
)(Select);

const WrappedCheckBox = FieldProvider(PropTypes.bool)(CheckBox);

export {
  WrappedInput as Input,
  WrappedSelect as Select,
  WrappedCheckBox as CheckBox,
};
