import fastAndSafeStringify from 'utils/safeStringify';
import { getMarkupByType } from './helpers';
import { Helmet } from 'react-helmet';
import { Params } from './types';
import { removeHTML } from 'utils/string';

function RichResults(props: Params) {
  const markup = getMarkupByType(props);
  return markup ?
      <Helmet
        script={[
          {
            innerHTML: fastAndSafeStringify(markup, (_key, value) =>
              typeof value === 'string' ? removeHTML(value) : value,
            ),
            type: 'application/ld+json',
          },
        ]}
      />
    : null;
}

export default RichResults;
