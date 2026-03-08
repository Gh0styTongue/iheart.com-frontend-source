import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';

export type InAppMessageExitData = {
  campaign?: string;
  link1?: string;
  link2?: string;
  messageType?: string;
  userTriggered?: boolean;
  exitType?: string;
  messageLink?: string;
};

export type InAppMessageOpenData = {
  campaign?: string;
  link1?: string;
  link2?: string;
  messageType?: string;
  userTriggered?: boolean;
};

export type InAppMessageExit = {
  iam: {
    campaign?: string;
    messageType?: string;
    userTriggered?: boolean;
    exitType?: string;
    messageLink?: string;
  };
};

export type InAppMessageOpen = {
  iam: {
    campaign?: string;
    messageType?: string;
    userTriggered?: boolean;
  };
};

export function getInAppMessageExit({
  campaign,
  exitType,
  messageType,
  userTriggered,
}: InAppMessageExitData): InAppMessageExit {
  return composeEventData(Events.InAppMessageExit)(
    namespace('iam')(
      property('campaign', campaign, true),
      property('exitType', exitType, true),
      property('messageType', messageType, true),
      property('userTriggered', userTriggered, true),
    ),
  ) as InAppMessageExit;
}

export function getInAppMessageOpen({
  campaign,
  messageType,
  userTriggered,
}: InAppMessageOpenData): InAppMessageOpen {
  return composeEventData(Events.InAppMessageExit)(
    namespace('iam')(
      property('campaign', campaign, true),
      property('messageType', messageType, true),
      property('userTriggered', userTriggered, true),
    ),
  ) as InAppMessageExit;
}
