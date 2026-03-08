import AppBody from 'views/App/AppBody';
import globalStyles from 'views/App/globalStyles';
import Head from 'views/App/Head';
import IProvideRadio from 'components/IProvideRadio';
import { Global } from '@emotion/react';
import type { PropsWithChildren } from 'react';
import type { Store } from 'redux';

type Props = PropsWithChildren<{
  lang: string;
  store: Store;
}>;

function InApp({ store, children, lang }: Props) {
  return (
    <IProvideRadio lang={lang} store={store}>
      <Global styles={globalStyles} />
      <Head lang={lang} />
      <AppBody>{children}</AppBody>
    </IProvideRadio>
  );
}

export default InApp;
