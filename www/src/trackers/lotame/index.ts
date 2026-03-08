import Events from 'modules/Analytics/constants/events';
import getStore from 'state/factory';
import init from 'vendor/lotame';
import whenPopulated from 'utils/whenPopulated';
import { executeScript } from '@iheartradio/web.signal';
import { getBirthYear, getGender } from 'state/Profile/selectors';
import { getSession } from 'state/Session/selectors';
import { loadScript } from 'utils/loadScript';
import type { MappedEventHandlers } from '../types';
import type { StationTypeValue } from 'constants/stationTypes';

type LotameObject = {
  getAudiences(x: number): Array<string> | undefined;
  collect(data: Record<string, unknown>): void;

  cmd: Array<() => unknown>;
};

export function getLotameInstance(
  lotameClientId: number,
): LotameObject | undefined {
  const lotameInstance =
    typeof window !== 'undefined' ?
      ((window as unknown as Record<string, unknown>)?.[
        `lotame_${lotameClientId}`
      ] as LotameObject | undefined)
    : undefined;

  return lotameInstance;
}

type BehaviorType = {
  act: Array<string>;
  med?: Array<string>;
  seg?: Array<string>;
};

const getGenresFromAdGenre = (genres: string): Array<string> => {
  return (
    genres
      ?.toString()
      .replace('genre_', '')
      .replaceAll('-', ' ')
      .split(' and ') ?? []
  );
};

const getUserandMediaInfo = async (
  act: BehaviorType['act'],
  namespace: string,
  genres: Array<string> = [],
) => {
  const store = getStore();
  const { profileId, isAnonymous } = await whenPopulated<
    ReturnType<typeof getSession>
  >(
    store,
    getSession,
    newValue => !!newValue.profileId && newValue.isAnonymous !== undefined,
  );

  let med: Array<string> = [];

  if (genres.length) {
    med = [
      `iHeart_genre: [${genres
        .map((genre: string) => `'${genre}'`)
        ?.join(',')}]`,
    ];
  }
  // No CCPA check as it is only for NZ
  if (isAnonymous) {
    if (med.length) {
      return { behaviors: { act, med } };
    }
    return { behaviors: { act } };
  }
  const state = store.getState();
  const birthYear = getBirthYear(state);
  const gender = getGender(state)?.toUpperCase().charAt(0);
  const seg = [`iHeart_birth_year: ${birthYear}`, `iHeart_gender: ${gender}`];
  if (med.length) {
    return {
      behaviors: { act, med, seg },
      thirdParty: {
        namespace,
        value: profileId,
      },
    };
  }
  return { behaviors: { act, seg } };
};

const LotameTracker = (
  lotameClientId: number,
  namespace: string,
  enabled: boolean,
) => ({
  enabled,

  name: 'New Lotame',

  initialize: async () => {
    executeScript(init(lotameClientId));
    await loadScript(
      `https://tags.crwdcntrl.net/lt/c/${lotameClientId}/lt.min.js`,
    );
  },

  events: {
    [Events.PageView]: async data => {
      const {
        pageName,
        pageType,
        stationName,
        name = '',
        genres = [],
        adGenre = '',
      } = data;
      const pageInfo = pageType ?? pageName;
      let pageDetail = stationName ?? name;
      pageDetail = pageDetail ? `- ${pageDetail}` : '';
      let pageGenre: Array<string> = [];

      let act: Array<string>;

      switch (pageInfo) {
        case 'live':
        case 'live_profile':
          act = [`Page View : live ${pageDetail}`];
          pageGenre = genres;
          break;
        case 'featured':
          act = [`Page View : Perfect For ${pageDetail}`];
          break;
        case 'artist':
        case 'artist_profile':
          act = [`Page View : Artist ${pageDetail}`];
          pageGenre = getGenresFromAdGenre(adGenre);
          break;
        case 'show':
        case 'talk':
        case 'podcast':
        case 'podcast_profile':
          act = [`Page View : Talk ${pageDetail}`];
          break;
        default:
          act = [`Page View : ${pageName}`];
          break;
      }

      const trackingData = {
        ...(await getUserandMediaInfo(act, namespace, pageGenre)),
      };

      const lotame = getLotameInstance(lotameClientId);

      lotame?.cmd.push(() => {
        lotame?.collect({ ...trackingData });
      });
    },
    [Events.StreamStart]: async payload => {
      const { station } = payload;
      const seedType = station?.get('seedType') as StationTypeValue | undefined;
      let genres = station?.get('genres')?.map(genre => genre.name);
      let act: Array<string> = [];

      if (!seedType) return;

      const seedName =
        seedType === 'track' ?
          `${station?.get('artistName')} - ${station?.get('name')}`
        : station?.get('name');

      if (seedType === 'artist') {
        const adGenre = station?.get('adGenre');
        if (adGenre?.length) {
          genres = getGenresFromAdGenre(adGenre);
        }
      }

      switch (seedType) {
        case 'live':
          if (station?.get('markets').length > 0) {
            const [primaryMarket] = station.get('markets');
            if (primaryMarket) {
              act = [
                `Station Play : ID - ${station?.get('callLetters')}`,
                `Station Play : Format - ${station?.get('format')}`,
                `Station Play : Market - ${primaryMarket.name}`,
              ];
            }
          }
          break;
        case 'featured':
          act = [`Station Play : Perfect For - ${seedName}`];
          break;
        case 'track':
          act = [`Station Play : Track - ${seedName}`];
          break;
        case 'artist':
          act = [`Station Play : Artist - ${seedName}`];
          break;
        case 'talk':
        case 'podcast':
          act = [`Station Play : Talk - ${seedName}`];
          break;
        default:
          act = [`Station Play : ${seedName}`];
          break;
      }

      const trackingData = {
        ...(await getUserandMediaInfo(act, namespace, genres)),
      };

      const lotame = getLotameInstance(lotameClientId);

      lotame?.cmd.push(() => {
        lotame?.collect({ ...trackingData });
      });
    },
  } as MappedEventHandlers,
});

export default LotameTracker;
