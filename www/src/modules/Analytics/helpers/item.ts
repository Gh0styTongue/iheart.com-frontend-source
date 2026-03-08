import { composeEventData, namespace, property } from '../factories';

export type Data = Readonly<{
  contentFrame?: string;
  id: number | string;
  inNetwork?: string;
  name?: string;
  pageHost?: string;
  pageName?: string;
  pageURL?: string;
  title?: string;
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: number | string;
  trackName?: string;
  type: string;
  artistName?: string;
  artistId?: number | string;
}>;

export type Item = {
  item: {
    asset: {
      id: string;
      name: string;
      sub: {
        id: string;
        name: string;
      };
    };
  };
};

export function item(data: Data) {
  if (!data.trackId) {
    return () => {};
  }

  const artistId = data.trackArtistId ?? data.artistId;
  const artistName = data.trackArtistName ?? data.artistName;

  return function (context: string): Item {
    return composeEventData(context)(
      namespace(
        'item',
        !!data.trackId,
      )(
        namespace('asset')(
          property(
            'id',
            data.type === 'podcast' ?
              `podcast|${data.id}`
            : `artist|${String(artistId)}`,
          ),
          property('name', data.type === 'podcast' ? data.name : artistName),
          namespace('sub')(
            property(
              'id',
              `${data.type === 'podcast' ? 'episode' : 'song'}|${String(
                data.trackId,
              )}`,
            ),
            property('name', data.trackName),
          ),
        ),
      ),
    ) as Item;
  };
}
