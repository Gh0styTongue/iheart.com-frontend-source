import { STATION_TYPE } from 'constants/stationTypes';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

export const STATION_TYPE_DESCRIPTION = {
  [STATION_TYPE.PODCAST]: 'Podcast',
  [STATION_TYPE.ARTIST]: 'Artist',
  [STATION_TYPE.TRACK]: 'Song',
  [STATION_TYPE.LIVE]: 'Station',
  [STATION_TYPE.COLLECTION]: 'Playlist',
  [STATION_TYPE.ALBUM]: 'Album',
} as const;

export const newSearchDescription = (
  translate: IGetTranslateFunctionResponse,
  contentType: keyof typeof STATION_TYPE_DESCRIPTION,
  byLine: string,
) => {
  switch (contentType) {
    case STATION_TYPE.PODCAST:
      return translate('Podcast');
    case STATION_TYPE.ARTIST:
      return translate('Artist');
    case STATION_TYPE.TRACK:
      if (byLine) {
        return `${translate('Song by')} ${byLine}`;
      } else {
        return translate('Song');
      }
    case STATION_TYPE.LIVE:
      return translate('Live Station');
    case STATION_TYPE.COLLECTION:
      return translate('Playlist');
    case STATION_TYPE.ALBUM:
      if (byLine) {
        return `${translate('Album by')} ${byLine}`;
      } else {
        return translate('Album');
      }
    default:
      return '';
  }
};

type ScopeComponents = {
  namespace: string;
  id: string;
  userId: string;
};

export function getNamespaceAndIds(pathname: string) {
  if (!pathname || pathname === '/') return [];
  const pathComponents = pathname.split('/').filter(str => str !== '');
  const namespaceIdPairs = pathComponents.reduce(
    (
      pairs: Array<ScopeComponents>,
      component: string,
      index: number,
    ): Array<ScopeComponents> => {
      if (index % 2 === 0) {
        const slug = pathComponents[index + 1];
        const slugComponents = slug?.split?.('-');
        const id = slugComponents?.pop?.();
        const userId =
          component === 'playlist' ? slugComponents?.pop?.() : null;
        return [
          ...pairs,
          {
            namespace: component,
            id: id as string,
            userId: userId as string,
          },
        ];
      } else {
        return pairs;
      }
    },
    [],
  );
  return namespaceIdPairs;
}

export function pathIsChildOrParent(path1: string, path2: string) {
  const namespaceAndIds1 = getNamespaceAndIds(path1);
  const namespaceAndIds2 = getNamespaceAndIds(path2);

  if (namespaceAndIds1.length === 0 || namespaceAndIds2.length === 0)
    return false;

  const shorterNameSpace =
    namespaceAndIds1.length <= namespaceAndIds2.length ?
      namespaceAndIds1
    : namespaceAndIds2;
  const longerNameSpace =
    namespaceAndIds1.length > namespaceAndIds2.length ?
      namespaceAndIds1
    : namespaceAndIds2;

  return shorterNameSpace.reduce(
    (
      didMatch: boolean,
      { namespace, id, userId }: ScopeComponents,
      index: number,
    ): boolean => {
      const longer = longerNameSpace[index];
      return (
        didMatch &&
        namespace === longer.namespace &&
        id === longer.id &&
        userId === longer.userId
      );
    },
    true,
  );
}
