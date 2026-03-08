import { artistReceived } from 'state/Artists/actions';
import { CONTEXTS } from 'modules/Logger';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getArtistByArtistId } from 'state/Artists/services';
import {
  getCurrentArtistId,
  makeArtistPath,
  makeArtistSongPath,
} from 'state/Artists/selectors';
import { getCurrentTrackId } from 'state/Tracks/selectors';
import { getLyrics, getTracksByIds } from 'state/Tracks/services';
import { getSectionId, getSlugId } from 'state/Routing/selectors';
import { isEmpty } from 'lodash-es';
import { PAGE_TYPE } from 'constants/pageType';
import { receivedTracks } from 'state/Tracks/actions';
import { setForce404data } from 'state/Routing/actions';
import { setHasHero } from 'state/Hero/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { AxiosResponse } from 'axios';
import type { GetAsyncData, State } from 'state/types';

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { transport, logger }) => {
    const state = getState();
    const id = getSlugId(state);
    const sectionId = getSectionId(state);
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);

    let artistData;
    try {
      artistData = await transport(
        getArtistByArtistId({ ampUrl, artistId: id, countryCode }),
      );
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'amp error');
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.ARTIST],
        errObj.message,
        {},
        errObj,
      );
    }

    const artist = (artistData as AxiosResponse<any>)?.data?.artist ?? {};

    let trackData;
    // sectionId will be a string if the last component of the slug is not a number.  This will always cause a 400
    if (typeof sectionId !== 'string' && sectionId) {
      try {
        trackData = await transport(
          getTracksByIds({ ampUrl, ids: [sectionId] }),
        );
      } catch (e: any) {
        const errObj =
          e instanceof Error ? e : new Error(e.statusText ?? 'amp error');
        logger.error(
          [CONTEXTS.ROUTER, CONTEXTS.ARTIST],
          errObj.message,
          {},
          errObj,
        );
      }
    }

    const track = (trackData as AxiosResponse<any>)?.data?.tracks?.[0];

    if (isEmpty(track) || isEmpty(artist)) {
      /**
       * cases:
       *  - empty artist and empty track - just 404
       *  - empty track but not empty artist - redirect
       *  - non-empty track but empty artist - try to update the artist from track info,
       */
      let suggestedTitle;
      let suggestedUrl;
      if (!isEmpty(track)) {
        suggestedTitle = `${track?.title} by ${track?.artistName}`;
        const artistPath =
          makeArtistPath(track?.artistName, track?.artistId) ?? null;
        suggestedUrl =
          makeArtistSongPath(artistPath, track?.title, track?.id) ?? undefined;
      } else if (!isEmpty(artist)) {
        suggestedTitle = artist?.artistName;
        suggestedUrl =
          makeArtistPath(artist?.artistName, artist?.artistId) ?? null;
      } else {
        suggestedTitle = 'Artist Directory';
        suggestedUrl = '/artist/';
      }
      dispatch(setForce404data({ suggestedTitle, suggestedUrl }));
      return { notFound: true, force404: true };
    }

    const { lyricsId } = track ?? {};

    let lyricsData;
    if (lyricsId) {
      try {
        lyricsData = await transport(getLyrics(lyricsId));
      } catch (e: any) {
        const errObj =
          e instanceof Error ? e : new Error(e.statusText ?? 'amp error');
        logger.error(
          [CONTEXTS.ROUTER, CONTEXTS.ARTIST],
          errObj.message,
          {},
          errObj,
        );
      }
    }

    const lyrics = (lyricsData as AxiosResponse<any>)?.data ?? '';

    dispatch(artistReceived([artist]));
    dispatch(receivedTracks([{ ...track, lyrics }]));
    dispatch(setHasHero(false));

    // Just to satisfy a ts & eslint warning about consistent returns
    return undefined;
  };

export function pageInfo(state: State) {
  const artistId = getCurrentArtistId(state);

  return {
    pageId: getCurrentTrackId(state),
    pageType: PAGE_TYPE.ARTIST_SONG,
    stationType: STATION_TYPE.CUSTOM,
    targeting: {
      name: 'song',
      modelId: artistId,
    },
  };
}
