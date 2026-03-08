import ErrorMessageStyles from 'components/FormFields/primitives/ErrorMessage';
import ErrorMessageWrapper from 'components/FormFields/primitives/ErrorMessageWrapper';
import Field from 'components/FormFields/primitives/Field';
import Label from 'components/FormFields/primitives/Label';
import { noop, omit } from 'lodash-es';
import { PureComponent } from 'react';

export default class Input extends PureComponent {
  static defaultProps = {
    collapseLabelMargin: false,
    onBlur: noop,
    onChange: noop,
    onFocus: noop,
    type: 'text',
    value: '',
  };

  onChange = ev => {
    const { value, name } = ev.target;
    const { onChange } = this.props;
    onChange(name, value);
  };

  onBlur = ev => {
    const { value, name } = ev.target;
    const { onBlur } = this.props;
    onBlur(name, value);
  };

  onFocus = ev => {
    const { value, name } = ev.target;
    const { onFocus } = this.props;
    onFocus(name, value);
  };

  render() {
    const {
      collapseLabelMargin,
      className,
      label,
      id,
      isSdk = false,
      toolTip,
      value,
      errorMessage,
      dataTest,
      ...otherProps
    } = this.props;

    // the name prop on the select tag is primarily for compatability with our legacy form system
    return (
      <>
        <Label
          className={className}
          collapseMargin={collapseLabelMargin}
          dataTest={dataTest}
          inputId={id}
          isSdk={isSdk}
          label={label}
          placeholderVisible={!value}
        >
          <Field
            {...omit(otherProps, ['initialValue'])}
            contentIsInvalid={!!errorMessage}
            data-test={`${dataTest}-field`}
            id={id}
            name={id}
            onBlur={this.onBlur}
            onChange={this.onChange}
            onFocus={this.onFocus}
            placeholder={label}
            title={toolTip || label}
            value={value}
          />
        </Label>
        {errorMessage ?
          <ErrorMessageWrapper data-test={`${dataTest}-error-message-wrapper`}>
            <ErrorMessageStyles>{errorMessage}</ErrorMessageStyles>
          </ErrorMessageWrapper>
        : null}
      </>
    );
  }
}
