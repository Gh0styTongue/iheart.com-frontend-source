import FieldError from './primitives/FieldError';
import { AriaError } from 'components/Auth/primitives/Error';
import { Component } from 'react';
import { identity, isEmpty } from 'lodash-es';

const FieldErrorIcon = () => (
  <div width="1.6rem">
    <svg
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.00065 0.333008C3.32065 0.333008 0.333984 3.31967 0.333984 6.99967C0.333984 10.6797 3.32065 13.6663 7.00065 13.6663C10.6807 13.6663 13.6673 10.6797 13.6673 6.99967C13.6673 3.31967 10.6807 0.333008 7.00065 0.333008ZM7.00065 7.66634C6.63398 7.66634 6.33398 7.36634 6.33398 6.99967V4.33301C6.33398 3.96634 6.63398 3.66634 7.00065 3.66634C7.36732 3.66634 7.66732 3.96634 7.66732 4.33301V6.99967C7.66732 7.36634 7.36732 7.66634 7.00065 7.66634ZM7.66732 9.66634C7.66732 10.0345 7.36884 10.333 7.00065 10.333C6.63246 10.333 6.33398 10.0345 6.33398 9.66634C6.33398 9.29815 6.63246 8.99967 7.00065 8.99967C7.36884 8.99967 7.66732 9.29815 7.66732 9.66634Z"
        fill="#A82700"
      />
    </svg>
  </div>
);

class Input extends Component {
  static propTypes = {
    ariaLabeledBy: PropTypes.string,
    ariaErrorMessage: PropTypes.string,
    autocomplete: PropTypes.string,
    autoFocus: PropTypes.bool,
    classes: PropTypes.array,
    collapseBottomMargin: PropTypes.bool,
    dataTest: PropTypes.string,
    disabled: PropTypes.bool,
    errorMessage: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onValidated: PropTypes.func,
    persistError: PropTypes.bool,
    placeholder: PropTypes.string,
    startOnFocus: PropTypes.bool,
    tabIndex: PropTypes.number,
    title: PropTypes.string,
    type: PropTypes.oneOf(['text', 'password', 'email', 'hidden', 'tel']),
    value: PropTypes.string,
  };

  static defaultProps = {
    ariaLabeledBy: undefined,
    ariaErrorMessage: undefined,
    autocomplete: undefined,
    autoFocus: undefined,
    classes: [],
    collapseBottomMargin: false,
    disabled: false,
    errorMessage: '',
    inputStyles: {},
    labelStyles: {},
    max: undefined,
    min: undefined,
    name: undefined,
    onBlur: identity,
    onChange: identity,
    onValidated: undefined,
    persistError: false,
    placeholder: '',
    startOnFocus: false,
    tabIndex: undefined,
    title: '',
    type: 'text',
    value: undefined,
  };

  state = {
    error: false,
    value: this.props.value,
  };

  validate(value) {
    let validated = false;
    if (
      this.props.validateFn &&
      (this.state.started || this.props.persistError)
    ) {
      validated = this.props.validateFn(value);
      this.setState(() => {
        return { error: !validated };
      });
    }
    return validated;
  }

  onChange = ev => {
    const event = { ...ev };
    this.props.onChange(event);
    const { value } = event.target;
    this.setState({ value });

    if (this.validate(value) && this.props.onValidated) {
      this.props.onValidated(value, ev);
    }
  };

  onFocus = () => {
    this.setState({ started: this.props.startOnFocus });
  };

  onBlur = e => {
    /**
     * When using setState callbacks in react, you are required to cache
     * synthetic event objects if you need access to them. Otherwise, it is
     * probable that they are dereferenced at the time you need them.
     */
    const event = { ...e };

    this.props.onBlur(event);
    const val = this.state.value;

    this.setState(
      {
        started: true,
      },
      () => {
        if (this.validate(val) && this.props.onValidated) {
          this.props.onValidated(val, event);
        }
      },
    );
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.state.started && nextProps.value !== this.state.value) {
      this.setState({ value: nextProps.value });
    }
  }

  render() {
    const classes = [''].concat(this.props.classes);
    if (this.state.error) classes.push('error');

    return (
      <section
        className={classes.join(' ')}
        css={{
          marginBottom:
            this.props.collapseBottomMargin ? '0.4rem    ' : '1.5rem',
        }}
      >
        <label css={this.props.labelStyles} htmlFor={this.props.name}>
          {this.props.title}
        </label>
        <input
          aria-labelledby={this.props.ariaLabeledBy}
          autoComplete={this.props.autocomplete}
          autoFocus={this.props.autoFocus}
          className={this.props.className}
          data-test={this.props.dataTest}
          disabled={this.props.disabled}
          max={this.props.max}
          min={this.props.min}
          name={this.props.name}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onFocus={this.onFocus}
          placeholder={this.props.placeholder}
          style={this.props.inputStyles}
          tabIndex={this.props.tabIndex}
          type={this.props.type || 'text'}
          value={this.state.value}
        />
        <div>
          <FieldError
            aria-hidden
            aria-labelledby="spoken"
            visible={
              this.state.error &&
              this.props.errorMessage &&
              !isEmpty(this.props.errorMessage)
            }
          >
            <FieldErrorIcon />
            {this.props.errorMessage}
          </FieldError>
          {this.props.ariaErrorMessage ?
            <AriaError aria-live="assertive" id="spoken">
              {this.props.ariaErrorMessage}
            </AriaError>
          : null}
        </div>
      </section>
    );
  }
}

export default Input;
