import { COUNTRIES } from './constants';
import { createSelector } from 'reselect';
import { State as ReduxState } from 'state/buildInitialState';
import { State, StationSoftgate } from './types';

export const getConfig = createSelector<ReduxState, ReduxState, State>(
  state => state,
  state => state?.config ?? {},
);

export const getCountryCode = createSelector<
  ReduxState,
  State,
  State['countryCode']
>(getConfig, config => config?.countryCode ?? COUNTRIES.US);

export const getCountryPhoneInfo = createSelector<
  ReduxState,
  State,
  State['phoneNumbers']
>(getConfig, config => ({
  ...(config?.phoneNumbers ?? {}),
  callingCode: config?.phoneNumbers?.callingCode ?? '1',
}));

export const getHost = createSelector<ReduxState, State, string>(
  getConfig,
  config => config?.hostName ?? 'webapp.us',
);

export const getUrls = createSelector<ReduxState, State, State['urls']>(
  getConfig,
  config => config?.urls ?? {},
);

export const getStationSoftgate = createSelector<
  ReduxState,
  State,
  StationSoftgate
>(getConfig, config => config?.stationSoftgate ?? ({} as StationSoftgate));

export const getAmpUrl = createSelector<ReduxState, State['urls'], string>(
  getUrls,
  urls => (__CLIENT__ ? urls?.api?.client : urls?.api?.server) ?? '',
);

export const getContentUrl = createSelector<ReduxState, State['urls'], string>(
  getUrls,
  urls => urls?.contentApi,
);

export const getLeadsUrl = createSelector<ReduxState, State['urls'], string>(
  getUrls,
  urls => urls?.leadsApi,
);

export const getIglooUrl = createSelector<ReduxState, State['urls'], string>(
  getUrls,
  urls => urls?.iglooUrl,
);

export const getReGraphQlUrl = createSelector<
  ReduxState,
  State['urls'],
  string
>(getUrls, urls => urls?.graphQlApi);

export const getWebGraphQlUrl = createSelector<
  ReduxState,
  State['urls'],
  string
>(getUrls, urls => urls?.webGraphQlApi);

export const getSiteUrl = createSelector<ReduxState, State['urls'], string>(
  getUrls,
  urls => urls?.site ?? '',
);

export const getMediaServerUrl = createSelector<
  ReduxState,
  State['urls'],
  string
>(getUrls, urls => urls?.radioEditMediaServer);

export const getPlaylistDirectoryMainUrl = createSelector<
  ReduxState,
  State['urls'],
  string
>(getUrls, urls => urls?.playlistDirectoryMain);

export const getRecaptchaKey = createSelector<ReduxState, State, string>(
  getConfig,
  config => config?.recaptcha?.key,
);

export const getChromecastAppId = createSelector<ReduxState, State, string>(
  getConfig,
  config => config?.googleCast?.appKey,
);

export const getChromecastEnabled = createSelector<ReduxState, State, boolean>(
  getConfig,
  config => config?.googleCast?.enabled,
);

export const getBrazeAppKey = createSelector<ReduxState, State, string>(
  getConfig,
  config => config?.braze?.appKey,
);

export const getBrazeBaseUrl = createSelector<ReduxState, State, string>(
  getConfig,
  config => config?.braze?.baseUrl ?? 'sdk.iad-01.braze.com',
);

export const getBrazeEnabled = createSelector<ReduxState, State, boolean>(
  getConfig,
  config => config?.braze?.enabled,
);

export const getTerminalId = createSelector<ReduxState, State, number>(
  getConfig,
  config => config?.terminalId,
);

export const getSupportedCountries = createSelector<
  ReduxState,
  State,
  Array<keyof typeof COUNTRIES>
>(
  getConfig,
  config => config?.supportedCountries as Array<keyof typeof COUNTRIES>,
);

export const getRecurly = createSelector<ReduxState, State, string>(
  getConfig,
  config => config?.recurly?.appKey ?? '',
);

export const getPIIRegulationConfig = createSelector<
  ReduxState,
  State,
  State['piiRegulation']
>(getConfig, config => config?.piiRegulation ?? ({} as State['piiRegulation']));

export const getValidation = createSelector<
  ReduxState,
  State,
  State['validation']
>(
  getConfig,
  config => config?.validation ?? ({ password: [] } as State['validation']),
);

export const getRegGateStationIds = createSelector<
  ReduxState,
  State,
  State['regGateStationIds']
>(getConfig, config => config?.regGateStationIds ?? []);

export const getHighlightsConfig = createSelector<
  ReduxState,
  State,
  State['highlights']
>(
  getConfig,
  config =>
    config?.highlights ?? {
      mobile: {
        apiKey: '',
        placementId: '',
        styleId: '',
      },
      desktop: {
        apiKey: '',
        placementId: '',
        styleId: '',
        height: 400,
      },
    },
);

export const getHighlightsApiUrl = createSelector<
  ReduxState,
  State['urls'],
  string
>(getUrls, urls => urls?.highlightsApi ?? 'https://api.begenuin.com');
