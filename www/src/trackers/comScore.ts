import Events from 'modules/Analytics/constants/events';
import getStore from 'state/factory';
import whenPopulated from 'utils/whenPopulated';
import { getProfileId } from 'state/Session/selectors';
import { ImageEmitter } from 'utils/imageEmitter';
import { isPrivacyOptOut } from './privacyOptOut';
import { loadScript } from 'utils/loadScript';
import { TrackerConfig, waitForGlobal } from '@iheartradio/web.signal';
import type { ComScoreBeaconPayload } from 'global';
import type { EventTypeMap } from './types';

const comScoreTracker = (
  id: string,
  enabled: boolean,
  pageviewCandidatePath: string,
): TrackerConfig<EventTypeMap> => {
  // Construct a URL with `pageViewCandidatePath` (`/api/comscore`) with the window's `origin`
  // (e.g., `https://www.iheart.com`) as the base url
  const pageviewCandidateUrl = new URL(
    pageviewCandidatePath,
    window.location.origin,
  );

  // Create a function that fires off the fetch to the pageview candidate url
  // we don't care about the return value, just that it gets fired off
  const pageviewCandidate = async () => {
    window.fetch(pageviewCandidateUrl, {
      // The default is GET, but just being explicit
      method: 'GET',
      // The ComScore docs are very adamant about the pageview candidate payload being the same
      // origin, so setting that `mode` here for completeness
      mode: 'same-origin',
      // And the docs are very adamant about the result not being cached, so setting `no-cache`
      // here in addition to the headers that are being set on the response.
      cache: 'no-store',
    });
  };

  ImageEmitter.subscribe({
    set({ property, value }) {
      if (
        enabled &&
        property === 'src' &&
        value?.includes('https://sb.scorecardresearch.com/b?c1=2')
      ) {
        // Call `pageviewCandidate` with setTimeout so that it goes to the end of the
        // task queue. This ensures that the Image actually loads before the Pageview Candidate
        // payload is requested.
        setTimeout(pageviewCandidate, 0);
      }
    },
  });

  return {
    enabled,

    name: 'ComScore',

    initialize: async () => {
      await loadScript(`https://sb.scorecardresearch.com/cs/${id}/beacon.js`, {
        async: true,
        id: 'comscore-beacon',
      });
      await waitForGlobal('COMSCORE');
    },

    events: {
      [Events.PageView]: async () => {
        if (window) {
          const comScoreMessage: ComScoreBeaconPayload = {
            c1: '2', // This is a magic string...
            c2: id,
          };
          const store = getStore();
          const profileId = await whenPopulated<
            ReturnType<typeof getProfileId>
          >(store, getProfileId);

          const privacyOptOut = isPrivacyOptOut(store.getState());

          comScoreMessage.cs_ucfr = privacyOptOut ? '0' : '1';
          comScoreMessage.cs_xi = String(profileId);

          comScoreMessage.options = {
            enableFirstPartyCookie: true,
            bypassUserConsentRequirementFor1PCookie: !privacyOptOut,
          };

          window.COMSCORE.beacon({
            ...comScoreMessage,
          });
        }
      },
    },
  };
};

export default comScoreTracker;
