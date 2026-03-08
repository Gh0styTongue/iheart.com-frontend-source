import Arrow from './primitives/Arrow';
import CompatabilityBorder from './primitives/CompatabilityBorder';
import CompatabilitySpaceHolder from './primitives/CompatabilitySpaceHolder';
import SelectPrimitive from './primitives/Select';
import { isEqual, noop, omit } from 'lodash-es';
import { PureComponent } from 'react';

export default class Select extends PureComponent {
  static defaultProps = {
    onBlur: noop,
    onChange: noop,
    onFocus: noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      isOnFocus: false,
    };
  }

  onChange = ev => {
    const { value, options, selectedIndex, name } = ev.target;
    const { text } = options[selectedIndex];
    this.props.onChange(name, { text, value });
  };

  onBlur = ev => {
    const { value, options, selectedIndex, name } = ev.target;
    const { text } = options[selectedIndex];
    this.setState({ isOnFocus: false });
    this.props.onBlur(name, { text, value });
  };

  onFocus = ev => {
    const { value, options, selectedIndex, name } = ev.target;
    const { text } = options[selectedIndex];
    this.setState({ isOnFocus: true });
    this.props.onFocus(name, { text, value });
  };

  placeholderIsVisible() {
    const { value, initialValue } = this.props;
    return initialValue && value ? isEqual(value, initialValue) : true;
  }

  render() {
    const {
      children,
      label,
      id,
      toolTip,
      value,
      text,
      dataTest,
      ...otherProps
    } = this.props;

    // The compatability tags are positioned in front of the actual select element.
    // This gives the appearance of consistant styling across browsers.
    // the name prop on the select tag is primarily for compatability with our legacy form system
    return (
      <div
        css={{ marginBottom: '1.6rem', position: 'relative' }}
        data-test={dataTest}
        id={id}
      >
        <CompatabilityBorder active={!!this.state.isOnFocus} />
        <CompatabilitySpaceHolder>{text || label}</CompatabilitySpaceHolder>
        <Arrow name="caret-down" />
        <SelectPrimitive
          {...omit(otherProps, 'initialValue')}
          ariaLabel={label}
          id={id}
          name={id}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onFocus={this.onFocus}
          placeholder={label}
          placeholderVisible={this.placeholderIsVisible()}
          title={toolTip || label}
          value={value}
        >
          {children}
        </SelectPrimitive>
      </div>
    );
  }
}
