import { artistReceived } from 'state/Artists/actions';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getArtistByArtistId } from 'state/Artists/services';
import { getArtistTopTracks } from 'state/Tracks/services';
import {
  getCurrentArtistId,
  getCurrentArtistTopTracks,
} from 'state/Artists/selectors';
import { getCurrentTrackId } from 'state/Tracks/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import { setHasHero } from 'state/Hero/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { GetAsyncData, State } from 'state/types';
import type { Track } from 'state/Artists/types';

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);
    const id = getSlugId(state);

    // IHRWEB-16379: Prevent superfluous calls. The topTracks don't contain artistId's
    // until our request is made. Once they have those we know we have the correct
    // data and we can prevent repeat requests.
    const topTracks = getCurrentArtistTopTracks(state);
    const hasArtistId = (track: Track) => track.artistId === id;
    if (topTracks.some(hasArtistId)) return;

    const { data: artistById } = await transport(
      getArtistByArtistId({ ampUrl, artistId: id, countryCode }),
    );

    const { data: artistTopTracks } = await transport(
      getArtistTopTracks({ ampUrl, artistId: id, limit: 50 }),
    );

    dispatch(
      artistReceived([
        { ...artistById.artist, tracks: artistTopTracks.tracks },
      ]),
    );
    dispatch(setHasHero(false));
  };

export function pageInfo(state: State) {
  const pageId = getCurrentTrackId(state);
  const artistId = getCurrentArtistId(state);

  return {
    pageId,
    pageType: PAGE_TYPE.ARTIST_SONG,
    stationType: STATION_TYPE.CUSTOM,
    targeting: {
      name: 'song',
      modelId: artistId,
    },
  };
}
