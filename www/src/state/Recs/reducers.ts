import { merge, setWith } from 'lodash-es';
import { State } from './types';

export const initialState = {
  artist: {},
  genre: {},
  canLoadMore: false,
};

type Payload = {
  defaultRecs?: boolean;
  id: number;
  recs: Array<{
    catalogId: number;
    catalogType: string;
    description: string;
    imgUrl: string;
    imgWidth: number;
    title: string;
    url: string;
  }>;
  type: string;
};

export function receiveRecs(
  state: State = initialState,
  { defaultRecs = true, id, recs = [], type }: Payload,
) {
  // TODO: IHRWEB-15997 refactor this reducer to not use lodash as part of clean up work
  return setWith(
    merge({}, state, {
      [type]: {
        defaultRecs,
        [id]: recs,
      },
    }),
    `[${type}][${id}]`,
    recs,
    Object,
  );
}

export const setCanLoadMore = (
  state: State = initialState,
  canLoadMore: boolean,
) => ({
  ...state,
  canLoadMore,
});
