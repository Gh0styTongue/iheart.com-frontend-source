/**
 * Constructs an adUnit for a live station
 */
export default function getLiveAdUnit({
  adId,
  provider = '',
  callLetters = '',
  marketName = '',
}: {
  adId: string;
  provider?: string;
  callLetters?: string;
  marketName?: string;
}) {
  let postfix = '';
  // We append .n (national) half the time
  if (Math.random() > 0.5) postfix = 'n';

  let formattedProvider = provider.toLowerCase();

  switch (formattedProvider) {
    case 'clear channel':
      formattedProvider = 'ccr';
      break;
    default:
      formattedProvider = formattedProvider.substr(0, 3) || 'ccr';
  }

  let formattedMarket = marketName.toLowerCase();

  if (formattedMarket) {
    formattedMarket = formattedMarket.replace('-', '.');
  }

  // Result will be something like /<adId>/ccr.newyork.ny.n/whtz-fm
  return `/${adId}/${[formattedProvider, formattedMarket, postfix]
    .filter(el => el)
    .join('.')}/${callLetters.toLowerCase()}`;
}
