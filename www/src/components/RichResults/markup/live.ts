import { getDeeplink } from 'shared/ui/common';
import { LiveMarkup } from '../types';

const getLiveMarkup = (meta: LiveMarkup) => {
  const {
    id,
    market,
    broadcastDisplayName,
    broadcastFrequency,
    description,
    callLetters,
    website,
    inLanguage = 'en-US',
    keywords,
    stationName,
    url,
    seedType,
  } = meta as LiveMarkup;
  return {
    '@context': 'https://schema.googleapis.com/',
    '@id': `www.iheart.com/live/${id}`,
    '@type': 'MusicPlaylist',
    creator: {
      '@reverse': {
        broadcastAffiliateOf: {
          '@type': 'BroadcastService',
          areaServed: {
            '@type': 'City',
            name: `${market.city}, ${market.stateAbbreviation}`,
          },
          broadcastDisplayName,
          broadcastFrequency: `${broadcastFrequency.frequency} ${broadcastFrequency.band}`,
          description,
          name: callLetters,
          sameAs: website,
        },
      },
      '@type': 'RadioStation',
      name: callLetters,
    },
    description,
    inLanguage,
    keywords,
    name: stationName,
    potentialAction: {
      '@type': 'ListenAction',
      expectsAcceptanceOf: {
        '@type': 'Offer',
        category: 'NoLoginRequired',
        eligibleRegion: [
          {
            '@type': 'Country',
            name: 'US,AU,NZ,CA',
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
          urlTemplate: `https://www.iheart.com${url}?autoplay=true`,
        },
        {
          '@type': 'EntryPoint',
          actionPlatform: [
            'https://schema.googleapis.com/GoogleAudioCast',
            'https://schema.googleapis.com/GoogleVideoCast',
          ],
          urlTemplate: `ihr://${getDeeplink(seedType, id).legacy}`,
        },
      ],
    },
    url: `https://www.iheart.com${url}`,
  };
};

export default getLiveMarkup;
