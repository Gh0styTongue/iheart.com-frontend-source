import buildScriptQueue from 'ads/utils/buildScriptQueue';
import logger, { CONTEXTS } from 'modules/Logger';
import { ControllerNames } from 'ads/slotControllers/types';
import type { SlotInstance } from 'ads/slotControllers/googleAds/types';

const { load, enqueue } = buildScriptQueue({
  globalVar: 'pbjs',
  queueKey: 'que',
  scopedName: 'pb',
});

export const loadRubicon = load;

export const fetchRubiconBids = async (
  slotInstance: SlotInstance,
  slotId: string,
) => {
  await enqueue(
    ({ pb: { rp } }) =>
      new Promise<void>(resolve => {
        // TODO: Warn if we didn't get any matching bids.
        // TODO: Reject on timeout.
        logger.info(
          [
            CONTEXTS.ADS,
            ControllerNames.Google,
            'fetchRubiconBids',
            `request - ${slotId}`,
          ],
          [`fetching Rubicon bids`, slotInstance],
        );
        rp.requestBids({
          callback: (slot: SlotInstance) => {
            logger.info(
              [
                CONTEXTS.ADS,
                ControllerNames.Google,
                'fetchRubiconBids',
                `response - ${slotId}`,
              ],
              ['Rubicon bids fetched', { slot }],
            );
            resolve();
          },
          gptSlotObjects: [slotInstance],
        });
      }),
  );
};
