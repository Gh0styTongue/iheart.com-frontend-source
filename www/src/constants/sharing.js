export function getShareMessage(
  translate,
  customRadioEnabled = true,
  onDemandEnabled = true,
) {
  if (customRadioEnabled && onDemandEnabled) {
    return translate(
      'All your favorite music, podcasts, and radio stations available for free. Listen to thousands of live radio stations or create your own artist stations and playlists. Get the latest music and trending news, from your favorite artists and bands.',
    );
  }
  if (customRadioEnabled) {
    return translate(
      'Stream thousands of the best live radio stations and custom artist stations for FREE - all in one app.',
    );
  }
  if (onDemandEnabled) {
    return translate(
      'Stream thousands of the best live radio stations for FREE, plus unlimited music on demand - all in one app.',
    );
  }
  return translate(
    'Stream thousands of the best live radio stations for FREE - all in one app.',
  );
}
