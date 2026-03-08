import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import { mapStationContent } from './helpers';
import { merge } from 'lodash-es';
import { ParsedRec, Rec } from './types';
import { SUB_TYPES } from './constants';
import { TILE_RES } from 'components/MediaServerImage';
import type { SubType } from './types';

type UnparsedRec = Record<string, any>;

const { ARTIST, LINK, LIVE, TRACK, FAVORITES } = SUB_TYPES;

export const parse = (unparsedRecs: Array<UnparsedRec>) =>
  unparsedRecs.reduce((parsed: Array<UnparsedRec>, rec: UnparsedRec) => {
    const isRecValid =
      rec.content && (rec?.content?.link ?? '').substr(0, 4) !== 'ihr:';
    const subType: SubType = rec?.subType ?? '';

    if (!isRecValid) return parsed;

    let { content } = rec;

    if ([ARTIST, LIVE, TRACK, FAVORITES].includes(subType)) {
      content = mapStationContent(rec);
    } else if (subType === LINK) {
      content = {
        ...rec.content,
        description: rec.subLabel,
        id: rec.label,
        imgUrl: rec.imagePath,
        name: rec.label,
        url: rec.content.link.replace('https://www.iheart.com', ''),
      };
    }

    return [...parsed, { ...rec, content }];
  }, []);

export function parseRecs(recs: Array<Rec> = []): Array<ParsedRec> {
  return (parse(recs) as Array<Rec>).map(({ content }) => ({
    catalogId: content!.seedId,
    catalogType: content!.seedType,
    description: content!.description,
    imgUrl: content!.logo || content!.imgUrl,
    imgWidth: TILE_RES,
    key: [content!.seedType, content!.seedId, content!.name].join('|'),
    playedFrom: PLAYED_FROM.DIR_GENRE_MAIN,
    title: content!.name,
    url: content!.url,
  }));
}

export function getMarketOps(market: {
  coords: {
    latitude: number;
    longitude: number;
  };
  zip: string;
}) {
  const opts = {
    limit: 3,
    template: 'LRRM,CR,DL',
  };
  const { zip, coords } = market ?? {};
  const { latitude, longitude } = coords ?? {};

  if (zip) {
    return merge({}, opts, {
      zipCode: zip,
    });
  }

  return merge({}, opts, {
    lat: typeof latitude === 'number' ? latitude.toFixed(2) : latitude,
    lng: typeof longitude === 'number' ? longitude.toFixed(2) : longitude,
  });
}
