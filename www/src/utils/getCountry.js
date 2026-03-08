export default function getCountry() {
  return (__CLIENT__ ? window.BOOT : {}).countryCode || 'US';
}
