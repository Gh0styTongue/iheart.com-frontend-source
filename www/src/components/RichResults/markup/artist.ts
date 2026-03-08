import { ArtistMarkup } from '../types';
import { getAndroidDeepLink, getDeeplink } from 'shared/ui/common';

const getArtistMarkup = (meta: ArtistMarkup) => {
  const { id, description, name, url, keywords, seedType } = meta;
  const idUrl = `www.iheart.com/artist/${id}`;
  return {
    '@context': 'https://schema.googleapis.com/',
    '@id': `${idUrl}/playlist`,
    '@type': 'MusicPlaylist',
    about: {
      '@id': `${idUrl}/group`,
      '@type': 'MusicGroup',
      description,
      name,
      url,
    },
    description,
    keywords,
    name,
    potentialAction: {
      '@type': 'ListenAction',
      expectsAcceptanceOf: {
        '@type': 'Offer',
        category: 'free',
        eligibleRegion: [
          {
            '@type': 'Country',
            name: 'US,AU,NZ',
          },
        ],
      },
      target: [
        {
          '@type': 'EntryPoint',
          actionPlatform: [
            'https://schema.org/DesktopWebPlatform',
            'https://schema.org/IOSPlatform',
            'https://schema.org/AndroidPlatform',
          ],
          urlTemplate: `${url}?autoplay=true`,
        },
        {
          '@type': 'EntryPoint',
          actionPlatform: [
            'https://schema.googleapis.com/GoogleAudioCast',
            'https://schema.googleapis.com/GoogleVideoCast',
          ],
          urlTemplate: `ihr://${getDeeplink(seedType, id).legacy}`,
        },
        getAndroidDeepLink(seedType, id),
      ],
    },
    url,
  };
};

export default getArtistMarkup;
