import composeRequest, {
  authHeaders,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import { CONTEXTS } from 'modules/Logger';
import { createSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import { getArtistUrl, getLiveUrl } from 'utils/url';
import { getCredentials } from 'state/Session/selectors';
import { getLiveStationById } from 'state/Live/services';
import type { AxiosResponse } from 'axios';
import type { State as GlobalState, Selector, Thunk } from 'state/types';
import type { LiveStation } from 'state/Live/types';
import type { SavedStation, State } from './types';

const constant = 'YOUR_LIBRARY:GET_SAVED_STATIONS';

enum SavedStationTypes {
  Artist = 'artist',
  Live = 'live',
  Favorite = 'favorites',
}

type SavedStations = {
  info: { [key in SavedStation['id']]: SavedStation };
  order: Set<SavedStation['id']>;
  reset: boolean;
};
type ArtistStation = {
  artistName: string;
  genreId: number;
  id: number;
  image: string;
};
type FavoriteStation = {
  artistSeed?: number;
  id: string;
  type: 'CR' | 'LR';
  stationType?: string;
  seedProfileId?: string;
  imagePath?: string;
  name?: string;
  link?: string;
};

type ArtistsByIdsResponse = AxiosResponse<{ artists: Array<ArtistStation> }>;
type LiveStationByIdResponse = AxiosResponse<{ hits: Array<LiveStation> }>;

// campaignId=foryou_favorites will return favorites + live + artist radio
function getFavoriteStations(
  ampUrl: string,
  profileId: number,
  sessionId: string,
  {
    limit = 30,
    offset = 0,
    hardFill = 0,
    campaignId = 'foryou_favorites',
  }: { limit: number; offset: number; hardFill?: number; campaignId?: string },
) {
  return composeRequest(
    method('get'),
    authHeaders(profileId, sessionId),
    urlTagged`${{ ampUrl }}/api/v2/profile/${{ profileId }}/favorites`,
    query({ limit, offset, hardFill, campaignId }),
  )();
}

function getArtistsByIds(ampUrl: string, artistIds: string) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/artists/${{ artistIds }}`,
  )();
}

const selector: Selector<Array<SavedStation>> = createSelector(
  (state: GlobalState): Array<SavedStation['id']> =>
    state.yourLibrary.savedStations.order,
  (state: GlobalState): { [key in SavedStation['id']]: SavedStation } =>
    state.yourLibrary.savedStations.info,
  (order, info) => order.map(id => info[id]),
);

function action(
  params: { limit: number; offset: number },
  reset: boolean,
): Thunk<Promise<void>> {
  return async function thunk(
    dispatch,
    getState,
    { logger, transport },
  ): Promise<void> {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const existingInfo = { ...state?.yourLibrary?.savedStations?.info };
    const idsToRequest = { LR: '', CR: '' };
    const savedStations: SavedStations = { info: {}, order: new Set(), reset };

    try {
      const getFavoriteStationsResponse: AxiosResponse<{
        values: Array<FavoriteStation>;
      }> = await transport(
        getFavoriteStations(
          ampUrl,
          profileId as number,
          sessionId as string,
          params,
        ),
      );
      // Get all saved sations from API
      const values = getFavoriteStationsResponse?.data?.values ?? [];
      (values as Array<FavoriteStation>).forEach(station => {
        const { artistSeed, id, type, stationType, seedProfileId, name, link } =
          station ?? {};

        let seedId = '';
        if (stationType === 'FAVORITES') {
          // Favorites contains all info we need to display, map the information directly.
          seedId = String(seedProfileId);
          if (!existingInfo[seedId]) {
            savedStations.info[seedId] = {
              id: seedId,
              name: String(`${name} Favorites Radio`),
              seedType: SavedStationTypes.Favorite,
              stationId: String(id),
              url: link,
            } as SavedStation;
          }
        } else {
          // Artist radio and Live radio doesnt have enough inforamtion will fire patch API request
          seedId = type === 'LR' ? String(id) : String(artistSeed);
          if (!existingInfo[seedId]) {
            idsToRequest[type] = `${idsToRequest[type]}${seedId},`;
            savedStations.info[seedId] = {
              id: seedId,
              stationId: String(id),
            } as SavedStation;
          }
        }

        savedStations.order.add(seedId);
      });
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }

    try {
      const [getArtistsByIdsResponse, getLiveStationByIdResponse]: [
        ArtistsByIdsResponse,
        LiveStationByIdResponse,
      ] = await Promise.all([
        idsToRequest.CR ?
          transport(getArtistsByIds(ampUrl, idsToRequest.CR))
        : Promise.resolve({ data: {} } as ArtistsByIdsResponse),
        idsToRequest.LR ?
          transport(getLiveStationById({ id: idsToRequest.LR, ampUrl }))
        : Promise.resolve({ data: {} } as LiveStationByIdResponse),
      ]);
      const artists = getArtistsByIdsResponse?.data?.artists ?? [];
      const liveStations = getLiveStationByIdResponse?.data?.hits ?? [];

      (artists as Array<ArtistStation>).forEach(artist => {
        savedStations.info[artist.id] = {
          ...savedStations.info[artist.id],
          imageUrl: artist.image,
          name: artist.artistName,
          seedType: SavedStationTypes.Artist,
          url: getArtistUrl(artist.id, artist.artistName) as string,
        };
      });

      (liveStations as Array<LiveStation>).forEach(liveStation => {
        savedStations.info[liveStation.id] = {
          ...savedStations.info[liveStation.id],
          imageUrl: liveStation.logo,
          name: liveStation.name,
          seedType: SavedStationTypes.Live,
          url: getLiveUrl(liveStation.id, liveStation.name) as string,
        };
      });
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }

    dispatch({ payload: savedStations, type: constant });
  };
}

function reducer(state: State, { info, order, reset }: SavedStations): State {
  const { info: existingInfo, order: existingOrder } = state.savedStations;
  const savedStations = {
    info: { ...existingInfo, ...info },
    order: reset ? [...order] : [...new Set([...existingOrder, ...order])],
  };
  return { ...state, savedStations };
}

export default {
  action,
  constant,
  reducer,
  selector,
};
