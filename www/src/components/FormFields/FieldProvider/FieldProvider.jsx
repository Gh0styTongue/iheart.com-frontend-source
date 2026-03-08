import { noop, omit } from 'lodash-es';
import { PureComponent } from 'react';

// TODO switch to React Context
// this is not technically a provider.  Since the context api is currently unstable, we're using props.
// This will hopefully be unnecesary in the future.

export default function makeFieldProvider(valueType = PropTypes.string) {
  return function ProviderWithType(Field) {
    return class FieldProvider extends PureComponent {
      static propTypes = {
        getErrorMessage: PropTypes.func,
        initialValue: valueType,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        persistError: PropTypes.bool,
        setInitialValue: PropTypes.func,
      };
      /* eslint-enable react/require-default-props */

      static defaultProps = {
        onBlur: noop,
        onChange: noop,
        onFocus: noop,
        persistError: false,
        setInitialValue: noop,
      };

      constructor(props) {
        super(props);
        const { initialValue, getErrorMessage } = props;
        this.state = {
          error:
            getErrorMessage && initialValue ?
              getErrorMessage(initialValue)
            : '',
          hasBlurred: false,
          value: initialValue,
        };
      }

      componentDidMount() {
        const { id, setInitialValue, initialValue } = this.props;
        setInitialValue(id, initialValue);
      }

      onChange = (name, value) => {
        const { onChange, getErrorMessage } = this.props;

        if (value && typeof value === 'object') {
          this.setState(value);
        } else {
          this.setState({ value });
        }

        const error = getErrorMessage ? getErrorMessage(value) : '';
        this.setState({ error });

        onChange(name, value, error);
      };

      onBlur = (name, value) => {
        const { onBlur, onChange, getErrorMessage, id } = this.props;

        if (value && typeof value === 'object') {
          this.setState(value);
        } else {
          this.setState({ value });
        }

        const error = getErrorMessage ? getErrorMessage(value) : '';
        this.setState({
          error,
          hasBlurred: true,
        });

        onChange(id, value, error);
        onBlur(name, value);
      };

      onFocus = (name, value) => {
        const { onFocus } = this.props;

        if (value && typeof value === 'object') {
          this.setState(value);
        } else {
          this.setState({ value });
        }

        this.setState({ hasBlurred: false });

        onFocus(name, value);
      };

      render() {
        const childProps = omit(this.props, ['getErrorMessage']);
        const { hasBlurred, value, error, ...otherState } = this.state;
        const { persistError } = this.props;
        const errorMessage = error || '';
        return (
          <Field
            {...childProps}
            value={value}
            {...otherState}
            errorMessage={hasBlurred || persistError ? errorMessage : ''}
            onBlur={this.onBlur}
            onChange={this.onChange}
            onFocus={this.onFocus}
          />
        );
      }
    };
  };
}
