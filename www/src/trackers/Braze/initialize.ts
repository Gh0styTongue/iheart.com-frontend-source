import * as UPSELL_FROM from 'modules/Analytics/constants/upsellFrom';
import analytics from 'modules/Analytics';
import logger, { CONTEXTS } from 'modules/Logger';
import reduxFactory from 'state/factory';
import whenPopulated from 'utils/whenPopulated';
import {
  EXIT_TYPE,
  MESSAGE_TYPE,
} from 'modules/Analytics/constants/inAppMessage';
import { getEmail } from 'state/Profile/selectors';
import { getSession } from 'state/Session/selectors';
import { GrowlIcons } from 'components/Growls/constants';
import { showNotifyGrowl } from 'state/UI/actions';

export type BrazeConfig = {
  apiKey: string;
  baseUrl: string;
  isDev: boolean;
  appVersion: string;
  enabled: boolean;
};

type Braze = typeof braze;

const store = reduxFactory();

const initBrazeUser = async (braze: Braze) => {
  const { profileId, isAnonymous } = await whenPopulated<
    ReturnType<typeof getSession>
  >(
    store,
    getSession,
    newValue => !!newValue.profileId && newValue.isAnonymous !== undefined,
  );
  if (isAnonymous) {
    braze.changeUser(String(profileId));
    braze.getUser()?.setEmail(null);
  } else {
    const email = await whenPopulated<ReturnType<typeof getEmail>>(
      store,
      getEmail,
    );
    braze.changeUser(String(profileId));
    braze.getUser()?.setEmail(email!);
  }
};

const initialize =
  ({ apiKey, baseUrl, isDev, appVersion, enabled }: BrazeConfig) =>
  async () => {
    logger.info(CONTEXTS.BRAZE, `initializing Braze. enabled: ${enabled}`);

    try {
      let primed = false;
      const braze = await import('@braze/web-sdk');
      window.braze = braze;
      // we set sessiontimeoutinseconds to either 1 for debugging or 30 minutes, which is brazes default
      braze.setLogger(message => logger.info(CONTEXTS.BRAZE, message));
      braze.initialize(apiKey, {
        allowUserSuppliedJavascript: true,
        appVersion,
        baseUrl,
        enableLogging: isDev,
        manageServiceWorkerExternally: !isDev,
        minimumIntervalBetweenTriggerActionsInSeconds: 1,
        sessionTimeoutInSeconds: 1800,
        serviceWorkerLocation: '/serviceWorker.js',
      });

      braze
        .getUser()
        ?.setCustomUserAttribute('Most Recent Web Version', appVersion);

      // IHRWEB-16027 - AA - 12-23-2020
      // There is a race condition between opening the session and setting the user
      // this prevents clearing the modals targeted at new users before they render
      if (!primed) {
        initBrazeUser(braze);
        primed = true;
      }

      braze.subscribeToInAppMessage(inAppMessage => {
        let shouldDisplay = true;
        let msgId;
        let notInButtonPath = true;

        if ('extras' in inAppMessage) {
          msgId = inAppMessage.extras['msg-id'];
        }
        const isPushPrimer = msgId === 'push-primer';

        // FullScreen and ModalMessages inherit from InAppMessage, but have buttons attribute
        if (
          inAppMessage instanceof braze.FullScreenMessage ||
          inAppMessage instanceof braze.ModalMessage
        ) {
          notInButtonPath = (inAppMessage.buttons || []).every(
            button =>
              (button.clickAction === braze.InAppMessage.ClickAction.URI &&
                !document.location.href.includes(String(button.uri))) ||
              isPushPrimer,
          );
          if (isPushPrimer) {
            if (inAppMessage.buttons[0] != null) {
              inAppMessage.buttons[0].subscribeToClickedEvent(() => {
                braze.requestPushPermission();
              });
            }
          }
        }

        if (inAppMessage instanceof braze.InAppMessage) {
          const isNotBlacklisted =
            inAppMessage.extras.suppress_on_page ?
              inAppMessage.extras.suppress_on_page
                .split(',')
                .map((url: string) => url.trim())
                .every(
                  (url: string) => document.location.href.indexOf(url) === -1,
                )
            : true;

          if (isPushPrimer) {
            if (
              !braze.isPushSupported() ||
              braze.isPushPermissionGranted() ||
              braze.isPushBlocked()
            ) {
              shouldDisplay = false;
            }
          }

          if (
            inAppMessage.extras?.campaign === 'web-rta_test' &&
            analytics?.trackInAppMessageOpen
          ) {
            analytics.trackInAppMessageOpen({
              campaign: inAppMessage.extras?.campaign,
              messageType: 'Modal',
              userTriggered: false,
            });
          }

          // Tracking braze modal dismiss to analytics for song2start campaign
          inAppMessage.subscribeToDismissedEvent(() => {
            const isSong2StartCompaign =
              inAppMessage.extras?.campaign ===
              'web-triggered-upsell-show-upsell-song2start';

            if (isSong2StartCompaign && analytics?.trackUpsellExit) {
              analytics.trackUpsellExit({
                destination: UPSELL_FROM.NEW_SCREEN,
                exitType: UPSELL_FROM.DISMISS,
                campaign: inAppMessage.extras?.campaign,
              });
            }

            if (
              inAppMessage.extras?.campaign === 'web-rta_test' &&
              analytics?.trackInAppMessageExit
            ) {
              analytics.trackInAppMessageExit({
                campaign: inAppMessage.extras?.campaign,
                exitType: EXIT_TYPE.USER_DISMISS,
                messageType: MESSAGE_TYPE.MODAL,
                userTriggered: true,
              });
            }

            const isPolarisBetaMessage = inAppMessage.message
              ?.toLocaleLowerCase()
              ?.includes('iheart beta');

            if (isPolarisBetaMessage) {
              store.dispatch(
                showNotifyGrowl({
                  icon: GrowlIcons.Info,
                  sticky: true,
                  title:
                    "Not ready to try yet? Look for the beta link in your inbox and give it a try when you're ready.",
                }),
              );
            }
          });

          shouldDisplay =
            shouldDisplay &&
            inAppMessage.message !== 'COPY' &&
            !inAppMessage.extras.suppress_on_web &&
            notInButtonPath &&
            isNotBlacklisted;

          if (shouldDisplay) {
            braze.showInAppMessage(inAppMessage);
            if (analytics?.trackPageView)
              analytics.trackPageView({ pageName: 'iam' });
          }
        }
      });

      braze.openSession();
      braze.logCustomEvent('prime-for-push');
    } catch (e) {
      logger.error(CONTEXTS.BRAZE, e);
    }
  };

export default initialize;
