import BoxWrapper from './primitives/BoxWrapper';
import CheckBoxBorder from './primitives/CheckBoxBorder';
import CheckBoxIcon from './primitives/CheckBoxIcon';
import CheckBoxInput from './primitives/CheckBoxInput';
import CheckBoxText from './primitives/CheckBoxText';
import classnames from 'classnames';
import { noop, omit } from 'lodash-es';
import { PureComponent } from 'react';

export default class CheckBox extends PureComponent {
  static defaultProps = {
    onChange: noop,
    value: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isOnFocus: false,
    };
  }

  onChange = event => {
    const { name, checked } = event.target;
    const { onChange } = this.props;
    onChange(name, checked, event);
  };

  onBlur = event => {
    const { name, checked } = event.target;
    const { onBlur } = this.props;
    this.setState({ isOnFocus: false });
    onBlur(name, checked, event);
  };

  onFocus = event => {
    const { name, checked } = event.target;
    const { onFocus } = this.props;
    this.setState({ isOnFocus: true });
    onFocus(name, checked, event);
  };

  render() {
    const {
      className,
      label,
      id,
      toolTip,
      value,
      dataTest,
      children,
      ...otherProps
    } = this.props;
    // the name prop on the select tag is primarily for compatability with our legacy form system
    return (
      <label
        className={classnames(className)}
        css={{ fontSize: '1.6rem', lineHeight: '2rem' }}
      >
        <BoxWrapper>
          <CheckBoxIcon active={!!value} name="check-skinny" />
          <CheckBoxInput
            {...omit(otherProps, ['initialValue'])}
            checked={!!value}
            data-test={dataTest}
            id={id}
            name={id}
            onBlur={this.onBlur}
            onChange={this.onChange}
            onFocus={this.onFocus}
            title={toolTip || label}
            type="checkbox"
            value={!!value}
          />
          <CheckBoxBorder active={!!this.state.isOnFocus} />
        </BoxWrapper>
        <CheckBoxText>{children || null}</CheckBoxText>
      </label>
    );
  }
}
