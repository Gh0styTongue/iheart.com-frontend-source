import ExpandArrowIcon from './primitives/ExpandArrowIcon';
import InputError from './primitives/FieldError';
import InputSelect from './primitives/InputSelect';
import InputSelectValue from './primitives/InputSelectValue';
import safeStringify from 'utils/safeStringify';
import { Component } from 'react';
import { isPlainObject } from 'lodash-es';

function maybeStringify(x) {
  try {
    return safeStringify(x);
  } catch (e) {
    return x;
  }
}

function isOption(p) {
  return (
    isPlainObject(p) &&
    Object.keys(p).includes('value') &&
    Object.keys(p).includes('title')
  );
}

class SelectBox extends Component {
  static propTypes = {
    classes: PropTypes.array,
    className: PropTypes.string,
    dataTest: PropTypes.string,
    inputClasses: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    selectClasses: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    selectStyles: PropTypes.object,
    selectedOption: PropTypes.any,
    tabIndex: PropTypes.number,
  };

  static defaultProps = {
    classes: [],
    className: '',
    dataTest: undefined,
    inputClasses: '',
    name: '',
    options: [],
    selectStyles: {},
    tabIndex: undefined,
  };

  state = {
    changed: false,
    selectedOption: this.props.selectedOption,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(props) {
    if (props.selectedOption) {
      // Reset selected value
      this.setState({
        selectedOption: null,
      });
    }
  }

  onChange = ev => {
    const select = ev.target;
    const selectedOption = this.getOptions()[select.selectedIndex];
    this.setState({ changed: true, selectedOption });
    if (this.props.onChange) {
      this.props.onChange(selectedOption.value, selectedOption.title);
    }
  };

  hasChanged = () => this.state.changed;

  blur = () => {
    this.innerSelectRef.blur();
  };

  getOptions = () =>
    this.props.options.map(p => {
      if (!isOption(p)) {
        return {
          title: p,
          value: p,
        };
      }
      if (p.value === undefined) {
        throw new Error(`Value for option ${p.title} cannot be undefined!`);
      } else {
        return p;
      }
    });

  render() {
    const classes = [''].concat(this.props.classes, this.props.className);
    const current = this.state.selectedOption || this.props.selectedOption;
    const options = this.getOptions();
    const selectClass = ['input-select'].concat(this.props.selectClasses);
    let currentIndex = 0;
    let label;

    const optionElements = options.map((o, index) => {
      if (current.title === o.title) currentIndex = index;

      return (
        // eslint-disable-next-line react/no-array-index-key
        <option key={index} value={maybeStringify(o.value)}>
          {o.title}
        </option>
      );
    });

    if (this.props.title) {
      label = (
        <label
          htmlFor={this.props.name}
          style={{ display: 'block', marginBottom: '1rem' }}
        >
          {this.props.title}
        </label>
      );
    }

    return (
      <div
        className={classes.join(' ')}
        css={this.props.selectStyles}
        data-test={this.props.dataTest}
      >
        {label}
        <InputSelect className={selectClass.join(' ')}>
          <InputSelectValue
            className={`${!this.state.changed ? ' default' : ''}`}
          >
            {options[currentIndex].title}
          </InputSelectValue>
          <select
            className={this.props.inputClasses}
            data-test={`${this.props.dataTest}-select`}
            name={this.props.name}
            onChange={this.onChange}
            ref={ref => {
              this.innerSelectRef = ref;
            }}
            tabIndex={this.props.tabIndex}
            value={current ? maybeStringify(options[currentIndex].value) : null}
          >
            {optionElements}
          </select>

          <ExpandArrowIcon onClick={this.onChange} />
        </InputSelect>
        <InputError>{this.props.errorMessage}</InputError>
      </div>
    );
  }
}

export default SelectBox;
