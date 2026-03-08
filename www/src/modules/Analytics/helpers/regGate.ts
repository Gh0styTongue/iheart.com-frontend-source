/* eslint-disable camelcase */

import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { locationMap } from '../constants/regGateFrom';

export function getTriggerLocation(context: string) {
  return locationMap[context as keyof typeof locationMap] || '';
}

export type Data = {
  exitType: string;
  trigger: string;
  type: string;
};

export type RegGate = {
  exitType?: string;
  trigger: string;
  type: string;
};

export type RegGateOpen = {
  regGate: RegGate;
};

export function getLatestRegGateData(regGateOpenArray: Array<RegGateOpen>) {
  const [regGateOpen] = regGateOpenArray.slice(-1);
  return regGateOpen.regGate;
}

export function getExitRegGateType(latestRegGateData: RegGate): string {
  return latestRegGateData.type;
}

export function getExitRegGateTrigger(latestRegGateData: RegGate): string {
  return latestRegGateData.trigger;
}

export function getRegGateOpenAnalyticsData(data: RegGate): RegGate {
  return composeEventData(Events.RegGateOpen)(
    namespace('regGate')(
      property('type', data.type, true),
      property('trigger', data.trigger, true),
    ),
  ) as RegGate;
}

export function getRegGateExitAnalyticsData(exitType: string) {
  return function regGateExitAnalyticsData({
    events,
  }: {
    events: {
      reg_gate_open: Array<RegGateOpen>;
    };
  }) {
    const { reg_gate_open } = events;
    return composeEventData(Events.RegGateExit)(
      namespace('regGate')(
        property(
          'type',
          getExitRegGateType(getLatestRegGateData(reg_gate_open)),
          true,
        ),
        property(
          'trigger',
          getExitRegGateTrigger(getLatestRegGateData(reg_gate_open)),
          true,
        ),
        property('exitType', exitType, true),
      ),
    );
  };
}
