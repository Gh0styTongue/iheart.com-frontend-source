import qs from 'qs';

export default function getAdswizzCompanionUrl({
  adswizzSubdomain,
  context,
  zoneId,
}: {
  adswizzSubdomain: string;
  context: string;
  zoneId: string;
}): string {
  return `//${adswizzSubdomain}.deliveryengine.adswizz.com/www/delivery/afr.php?${qs.stringify(
    {
      context,
      zoneId,
      cb: Math.round(Math.random() * 1000000000),
    },
  )}`;
}
