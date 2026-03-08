import AppBody from './AppBody';
import BottomFixed from './BottomFixed';
import ConnectedModals from 'components/ConnectedModals';
import cookie from 'js-cookie';
import countryCodes from 'constants/countryCodes';
import CustomInStreamAd from 'ads/shims/CustomInStreamAd';
import dispatchDeferredAction from 'utils/dispatchDeferredAction';
import FullScreenPlayerModal from 'components/Player/FullScreenPlayerModal';
import globalStyles from './globalStyles';
import Growls from 'components/Growls';
import Head from './Head';
import Header from 'components/Header';
import IProvideRadio from 'components/IProvideRadio';
import MiniPlayer from 'components/Player/MiniPlayer';
import OfflineHandler from 'components/OfflineHandler';
import ReorderPlaylistContext from 'contexts/ReorderPlaylist';
import SideNav from 'components/SideNav';
import SoftGate from 'views/App/SoftGate';
import Targeting from 'ads/components/Targeting';
import useMount from 'hooks/useMount';
import { CanadaPrivacyBanner } from 'components/CanadaPrivacyBanner/CanadaPrivacyBanner';
import {
  type FunctionComponent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { getCountryCode } from 'state/Config/selectors';
import { getIsAnonymous, getIsLoggedOut } from 'state/Session/selectors';
import { Global } from '@emotion/react';
import type { Store } from 'redux';

type Props = {
  children: ReactNode;
  lang: string;
  store: Store;
};

const App: FunctionComponent<Props> = ({ store, children, lang }) => {
  const state = store.getState();
  const loggedOut = getIsLoggedOut(state);
  const isCanada = getCountryCode(state) === countryCodes.CA;
  const bannerCookie = cookie.get('canadaPrivacyBanner');
  const [showBanner, setShowBanner] = useState(false);
  const isAnonymous = getIsAnonymous(state);

  useMount(() => {
    if (loggedOut) return;
    dispatchDeferredAction();
  });

  useEffect(() => {
    setShowBanner(!bannerCookie);
  }, [bannerCookie]);

  return (
    <IProvideRadio lang={lang} store={store}>
      <Global styles={globalStyles} />
      <Head lang={lang} />
      <SoftGate />
      <SideNav />
      <Header />
      <AppBody>{children}</AppBody>
      <ReorderPlaylistContext.Consumer>
        {({ active }) => (
          <BottomFixed reorderActive={active}>
            <MiniPlayer />
          </BottomFixed>
        )}
      </ReorderPlaylistContext.Consumer>
      {isCanada && showBanner && isAnonymous ?
        <CanadaPrivacyBanner setShowBanner={setShowBanner} />
      : <div />}
      <Growls />
      <ConnectedModals />
      <FullScreenPlayerModal />
      <Targeting />
      <CustomInStreamAd />
      <OfflineHandler />
    </IProvideRadio>
  );
};

export default App;
