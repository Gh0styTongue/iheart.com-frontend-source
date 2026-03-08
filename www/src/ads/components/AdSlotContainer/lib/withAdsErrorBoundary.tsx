import logger, { CONTEXTS } from 'modules/Logger';
import { Component, useCallback, useState } from 'react';
import type { AdSlotContainerProps, AdSlotContainerType } from '../types';

type Props = {
  onError: (error: Error) => void;
  hasError: boolean;
};

class AdsErrorBoundary extends Component<Props> {
  // Needed for React error boundary to catch React errors
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

export default function withAdsErrorBoundary(
  AdSlotContainer: AdSlotContainerType,
) {
  return function AdSlotContainerWrapped(
    props: Omit<AdSlotContainerProps, 'onError'> & {
      onError?: (error: any) => void;
    },
  ) {
    const [hasError, setHasError] = useState(false);

    const onError = useCallback(
      error => {
        setHasError(true);
        props?.onError?.(error);
        const errObj = error instanceof Error ? error : new Error(error);
        logger.error(CONTEXTS.ADS, error, {}, errObj);
      },
      [setHasError],
    );

    return hasError ? null : (
        <AdsErrorBoundary hasError={hasError} onError={onError}>
          {/* eslint-disable-next-line */}
          <AdSlotContainer
            {...(props as AdSlotContainerProps)}
            onError={onError}
          />
        </AdsErrorBoundary>
      );
  };
}
