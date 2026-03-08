import ButtonWrapper from './primitives/ButtonWrapper';
import ErrorMessageStyles from 'components/FormFields/primitives/ErrorMessage';
import ErrorMessageWrapper from 'components/FormFields/primitives/ErrorMessageWrapper';
import FilledButton from 'primitives/Buttons/FilledButton';
import MFRInput from './RenameMFRInput';
import OutlinedButton from 'primitives/Buttons/OutlinedButton';
import Wrapper from './primitives/Wrapper';
import { noop } from 'lodash-es';
import { PureComponent } from 'react';

export default class RenameMFR extends PureComponent {
  static propTypes = {
    errorMessage: PropTypes.string,
    onBlur: PropTypes.func,
    onCancel: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onSave: PropTypes.func,
    small: PropTypes.bool,
    value: PropTypes.string,
  };
  /* eslint-enable react/require-default-props */

  static defaultProps = {
    onBlur: noop,
    onChange: noop,
    onFocus: noop,
    onSave: noop,
    small: false,
  };

  onSave = () => {
    const { onSave, value } = this.props;
    onSave(value.trim().concat(' '));
  };

  onCancel = () => {
    const { onCancel, value } = this.props;
    onCancel(value);
  };

  onFocus = event => {
    const { onFocus } = this.props;
    const { name, value } = event.target;
    onFocus(name, value.trim(), event);
  };

  onBlur = event => {
    const { onBlur } = this.props;
    const { name, value } = event.target;
    onBlur(name, value.trim(), event);
  };

  onChange = event => {
    const { value, name } = event.target;
    const { onChange } = this.props;

    const trimmedValue = value.trim();

    if (trimmedValue.length > 16) return;

    const withSpace =
      value.endsWith(' ') ? trimmedValue.concat(' ') : trimmedValue;
    onChange(name, withSpace, event);
  };

  render() {
    const { value, errorMessage, textClass, small } = this.props;
    return (
      <Wrapper data-test="mfr-form-wrapper" small={small}>
        <MFRInput
          onBlur={this.onBlur}
          onChange={this.onChange}
          onFocus={this.onFocus}
          textClass={textClass}
          value={value}
        />
        {errorMessage ?
          <ErrorMessageWrapper>
            <ErrorMessageStyles>{errorMessage}</ErrorMessageStyles>
          </ErrorMessageWrapper>
        : null}
        <ButtonWrapper>
          <FilledButton
            data-test="renamemfr-savebtn"
            disabled={!!errorMessage || (value && value.length < 2)}
            isBlock
            marginRight="1rem"
            marginTop="2rem"
            onClick={this.onSave}
            styleType="cta"
          >
            Save
          </FilledButton>
          {this.props.onCancel ?
            <OutlinedButton
              data-test="renamemfr-cancelbtn"
              isBlock
              marginLeft="1rem"
              marginTop="2rem"
              onClick={this.onCancel}
            >
              Cancel
            </OutlinedButton>
          : null}
        </ButtonWrapper>
      </Wrapper>
    );
  }
}
