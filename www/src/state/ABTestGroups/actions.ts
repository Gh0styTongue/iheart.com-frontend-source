import analytics from 'modules/Analytics';
import composeRequest, { body, method, urlTagged } from 'api/helpers';
import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import { forceABTestSelector } from 'state/Features/selectors';
import { getAccountType } from 'state/Profile/selectors';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getLangPrefix } from 'state/i18n/selectors';
import { getProfileId } from 'state/Session/selectors';
import { getUserType } from 'state/User/selectors';
import { QUERY_FOR_AB_TEST_GROUP } from './constants';
import { Thunk } from 'state/types';

type Data = {
  at: string;
  groups: {
    [group: string]: string;
  };
  meta: any;
} | null;

export function queryForABTestGroup(): Thunk<Promise<Data>> {
  return async function thunk(dispatch, getState, { logger }) {
    try {
      const state = getState();
      const ampUrl = getAmpUrl(state);
      const country = getCountryCode(state).toLowerCase();
      const lang = getLangPrefix(state);
      const profileId = getProfileId(state);
      const accountType = getAccountType(state)?.toLowerCase();
      const userType = getUserType(state).toLowerCase();
      const deviceId = analytics.getDeviceId();
      const forceGroups = forceABTestSelector(state);

      const { data } = await transport(
        composeRequest(
          body({
            meta: {
              platform: 'web',
              accountType,
              country,
              deviceId,
              lang,
              userType,
            },
            userId: String(profileId),
          }),
          method('post'),
          urlTagged`${{ ampUrl }}/api/v3/abtest/users/groups/query`,
        )(),
      );
      data.groups = { ...data.groups, ...forceGroups };

      analytics.set({
        user: {
          abTestGroup: Object.entries(data.groups).map(
            ([key, value]) => `${key}|${value}`,
          ),
        },
      });

      dispatch({
        meta: {
          cookies: {
            set: {
              DEVICE_ID: {
                config: { path: '/', expires: 365 },
                value: deviceId,
              },
            },
          },
        },
        payload: data,
        type: QUERY_FOR_AB_TEST_GROUP,
      });

      return data;
    } catch (error) {
      const errObj =
        error instanceof Error ? error : new Error(error as string | undefined);
      logger.error([CONTEXTS.ANALYTICS, 'AB_TESTS'], error, {}, errObj);
      throw errObj;
    }
  };
}
