import composeRequest, {
  authHeaders,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import getMajorVersion from 'utils/getMajorVersion';
import graphQL from 'api/graphql';
import { identity } from 'lodash-es';

export const getUserLocationConfig = (ampUrl, env, userName) =>
  composeRequest(
    method('GET'),
    urlTagged`${{ ampUrl }}/api/v3/locationConfig`,
    query({
      email: userName,
      hostname: 'webapp',
      version: `${getMajorVersion()}-${env}`,
    }),
  );

export const getCountryLocationConfig = (
  ampUrl,
  env,
  countryCode,
  credentials,
) =>
  composeRequest(
    method('GET'),
    urlTagged`${{ ampUrl }}/api/v3/locationConfig`,
    query({
      countryCode,
      hostname: 'webapp',
      version: `${getMajorVersion()}-${env}`,
    }),
    credentials ?
      authHeaders(credentials.profileId, credentials.sessionId)
    : identity,
  );

export function getLeadsData({ baseUrl, countryCode, locale }) {
  return graphQL(
    baseUrl,
    {
      forYouHeroQuery: {
        subscription: {
          tags: ['collections/web-homescreen', `countries/${countryCode}`],
        },
      },
      holidayHatQuery: {
        subscription: {
          tags: [
            'collections/holiday-hat',
            `countries/${countryCode}`,
            'devices/web',
          ],
        },
      },
      locale,
    },
    `
      query Leads($forYouHeroQuery: QueryInput!, $holidayHatQuery: QueryInput!, $locale: String) {
        ForYouHero:leads(query: $forYouHeroQuery, locale: $locale) {
          img_uri
          background_color
          title
          link {
            urls {
              web
            }
            name
            target
          }
        },
        HolidayHat:leads (
          query: $holidayHatQuery,
          locale: $locale
        ) {
          img_uri
          title
        }
      }
    `,
  );
}
