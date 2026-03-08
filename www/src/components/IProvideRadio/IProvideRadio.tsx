import GlobalErrorBoundary from 'components/GlobalErrorBoundary/GlobalErrorBoundary';
import I18n from 'redux-i18n';
import PlayerStateContext from 'contexts/PlayerState';
import PlayerTimeContext from 'contexts/PlayerTime';
import RenamePlaylistContext from 'contexts/RenamePlaylist';
import ReorderPlaylistContext from 'contexts/ReorderPlaylist';
import ThemeContext from 'contexts/Theme';
import trackers from 'trackers';
import Trackers from 'contexts/Trackers';
import TranslateContext from 'contexts/TranslateContext';
import { AdsPlayerContext, AdsProvider } from 'ads';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { Store } from 'redux';

type Props = {
  children: ReactNode;
  lang: string;
  store: Store;
};

function IProvideRadio({ lang, store, children }: Props) {
  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <I18n initialized initialLang={lang} translations={{}} useReducer>
          <TranslateContext.Provider>
            <ThemeContext.Provider>
              <ReorderPlaylistContext.Provider>
                <RenamePlaylistContext.Provider>
                  <PlayerStateContext.Provider>
                    <PlayerTimeContext.Provider>
                      <AdsProvider>
                        <AdsPlayerContext.Provider>
                          <Trackers.Provider value={trackers}>
                            {children}
                          </Trackers.Provider>
                        </AdsPlayerContext.Provider>
                      </AdsProvider>
                    </PlayerTimeContext.Provider>
                  </PlayerStateContext.Provider>
                </RenamePlaylistContext.Provider>
              </ReorderPlaylistContext.Provider>
            </ThemeContext.Provider>
          </TranslateContext.Provider>
        </I18n>
      </Provider>
    </GlobalErrorBoundary>
  );
}

export default IProvideRadio;
