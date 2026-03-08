import TranslateContext from './TranslateContext';
import { localize } from 'redux-i18n';
import { ReactNode } from 'react';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

type Props = {
  children: ReactNode;
  translate: IGetTranslateFunctionResponse;
};

function TranslateProvider({ children, translate }: Props) {
  return (
    <TranslateContext.Provider value={translate}>
      {children}
    </TranslateContext.Provider>
  );
}

export default localize<Props>('translate')(TranslateProvider);
