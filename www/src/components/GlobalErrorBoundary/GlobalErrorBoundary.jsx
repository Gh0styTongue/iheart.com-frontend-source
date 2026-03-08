import logger, { CONTEXTS } from 'modules/Logger';
import { PureComponent } from 'react';

class GlobalErrorBoundary extends PureComponent {
  componentDidCatch(error) {
    const errObj = error instanceof Error ? error : new Error(error);
    logger.error(CONTEXTS.REACT, error, {}, errObj);
  }

  render() {
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
