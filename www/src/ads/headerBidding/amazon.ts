import buildScriptQueue from 'ads/utils/buildScriptQueue';
import logger, { CONTEXTS } from 'modules/Logger';
import { ControllerNames } from 'ads/slotControllers/types';

const HEADER_BIDDING_TIMEOUT = 2000;

type AmazonFetchBidsResponse = {
  amznactt: string;
  amznbid: string;
  amzniid: string;
  amznp: string;
  amznsz: string;
  size: string;
  slotID: string;
  mediaType?: string;
  encodedQsParams?: object;
};

const { load, enqueue, isLoadedCalled } = buildScriptQueue({
  globalVar: 'apstag',
  queueKey: null,
  scopedName: 'aps',
});

export const loadAmazon = (
  scriptUrl: string,
  { apsPubId }: { apsPubId: string },
) =>
  load(scriptUrl, ({ aps }) => {
    aps.init({
      pubID: apsPubId,
      adServer: 'googletag',
    });
  });

export const fetchAmazonBids = async (
  slotId: string,
  dimensions: Array<[number, number]>,
  mediaType?: 'video' | 'display' | undefined,
): Promise<string | undefined> => {
  if (isLoadedCalled) {
    const apsSlot = {
      mediaType,
      slotID: mediaType === 'video' ? 'preroll' : slotId,
      slotName: slotId,
      sizes: dimensions,
    };

    const amazonbidsQueue = (await enqueue(
      ({ aps }) =>
        new Promise<void | string>(resolve => {
          logger.info(
            [
              CONTEXTS.ADS,
              ControllerNames.Google,
              'fetchAmazonBids',
              `request - ${slotId}`,
            ],
            ['fetching Amazon bids', { apsSlot }],
          );
          aps.fetchBids(
            {
              slots: [apsSlot],
              timeout: HEADER_BIDDING_TIMEOUT,
            },
            (responses: Array<AmazonFetchBidsResponse>) => {
              logger.info(
                [
                  CONTEXTS.ADS,
                  ControllerNames.Google,
                  'fetchAmazonBids',
                  `response - ${slotId}`,
                ],
                ['Amazon bids fetched', { apsSlot, responses }],
              );

              const targeting = responses
                .filter(bid => bid.mediaType === 'video')
                .map(
                  // @ts-expect-error
                  bid => bid.encodedQsParams || bid.helpers.encodedQsParams(),
                )
                .join('');

              let encodedTargeting = '';

              if (targeting) {
                try {
                  encodedTargeting = decodeURIComponent(targeting) ?? '';
                } catch (e) {
                  logger.error(
                    [CONTEXTS.ADS, ControllerNames.Google, 'fetchAmazonBids'],
                    { targeting, responses },
                    undefined,
                    e as Error,
                  );
                }
              }

              resolve(encodedTargeting);
            },
          );
        }),
    )) as Promise<string>;

    return amazonbidsQueue;
  } else {
    return undefined;
  }
};
