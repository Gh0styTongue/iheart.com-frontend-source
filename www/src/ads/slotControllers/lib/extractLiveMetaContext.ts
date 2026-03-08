import logger, { CONTEXTS } from 'modules/Logger';
import type { LiveMetaValues } from 'ads/targeting/useLiveMetadata';

export default function extractLiveMetaDataContext(
  liveMetaData: LiveMetaValues['liveMetaData'],
): string | null {
  // TODO: Abstract this out into targeting hook.

  // there is a magic string that will be on the metadata payload that dictates
  // the ad, this string will be in a different place depending on provider and
  // browser.

  const comment: string =
    liveMetaData?.comment ??
    (liveMetaData?.COMM as { ENG: string })?.ENG ??
    (liveMetaData as { COMM: string })?.COMM ??
    '';

  // get the bit after the "=" sign.
  const context: string | undefined = /adContext="(.*?)"/.exec(comment)?.[1];

  if (comment !== '') {
    logger.info([CONTEXTS.ADS, 'extractLiveMetaDataContext'], {
      comment,
      context,
    });
  }

  return context ?? null;
}
