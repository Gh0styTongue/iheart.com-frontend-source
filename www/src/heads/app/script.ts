import safeStringify from 'utils/safeStringify';
import { ScriptObject } from '../types';

export default (): Array<ScriptObject> => [
  {
    innerHTML: `
      // https://stackoverflow.com/questions/49986720/how-to-detect-internet-explorer-11-and-below-versions

      if (!!window.navigator.userAgent.match(/MSIE|Trident/)) {
        window.location.replace('https://help.iheart.com/hc/en-us/articles/229182368-Troubleshooting-browser-issues-with-iHeartRadio');
      }
    `,
    type: 'text/javascript',
  },
  {
    innerHTML: safeStringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      potentialAction: [
        {
          '@type': 'SearchAction',
          'query-input': 'required name=search_term_string',
          target: 'https://www.iheart.com/search?q={search_term_string}',
        },
      ],
      url: 'https://www.iheart.com/',
    }),
    type: 'application/ld+json',
  },
];
