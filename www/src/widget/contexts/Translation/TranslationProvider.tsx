import PropTypes from 'prop-types';
import TranslationContext from './TranslationContext';
import { ReactNode } from 'react';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

type Props = {
  children: ReactNode;
};

/**
 * TranslationProvider looks for redux-i18n's translate function 't' passed via legacy React context
 * API and passes down through our own context provider.
 */

function TranslationProvider(
  props: Props,
  context: {
    t: IGetTranslateFunctionResponse;
  },
) {
  return (
    <TranslationContext.Provider value={context.t}>
      {props.children}
    </TranslationContext.Provider>
  );
}

TranslationProvider.contextTypes = {
  t: PropTypes.func.isRequired,
};

export default TranslationProvider;
