import { composeEventData, namespace, property } from '../factories';

export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type Data = {
  adobeVersion?: string;
  appSessionId?: string;
  browserHeight?: string;
  browserWidth?: string;
  callId?: string;
  dayOfWeek?: DayOfWeek;
  gpcEnabled?: boolean;
  hourOfDay?: number;
  id?: string | null;
  isPlaying?: boolean;
  querystring?: { [key: string]: string };
  referer?: string;
  refererDomain?: string;
  reportedDate?: number;
  screenOrientation?: string;
  screenResolution?: string;
  sequenceNumber?: number;
  sessionNumber?: number;
  timezone?: string;
  userAgent?: string;
  visitorId?: string | null;
  volume?: number;
  isCrawler?: boolean;
};

export type GlobalData = {
  global: {
    device: {
      adobeVersion?: Data['adobeVersion'];
      appSessionId?: Data['appSessionId'];
      browserHeight?: Data['browserHeight'];
      browserWidth?: Data['browserWidth'];
      callId?: Data['callId'];
      dayOfWeek?: Data['dayOfWeek'];
      gpcEnabled?: Data['gpcEnabled'];
      hourOfDay?: Data['hourOfDay'];
      id?: Data['id'];
      isPlaying?: Data['isPlaying'];
      reportedDate?: Data['reportedDate'];
      referer?: Data['referer'];
      refererDomain?: Data['refererDomain'];
      screenOrientation?: Data['screenOrientation'];
      screenResolution?: Data['screenResolution'];
      sessionNumber?: Data['sessionNumber'];
      timezone?: Data['timezone'];
      userAgent?: Data['userAgent'];
      volume?: Data['volume'];
      isCrawler?: Data['isCrawler'];
    };
    querystring: Data['querystring'];
    session: {
      sequenceNumber?: Data['sequenceNumber'];
    };
    user: {
      visitorId?: Data['visitorId'];
    };
  };
};

function globalData(data: Data): GlobalData {
  return composeEventData('global')(
    namespace('global')(
      namespace('device')(
        property('adobeVersion', data.adobeVersion),
        property('appSessionId', data.appSessionId),
        property('browserHeight', data.browserHeight),
        property('browserWidth', data.browserWidth),
        property('callId', data.callId),
        property('dayOfWeek', data.dayOfWeek),
        property('gpcEnabled', data.gpcEnabled),
        property('hourOfDay', data.hourOfDay),
        property('id', data.id),
        property('isPlaying', data.isPlaying),
        property('referer', data.referer),
        property('refererDomain', data.refererDomain),
        property('reportedDate', data.reportedDate),
        property('screenOrientation', data.screenOrientation),
        property('screenResolution', data.screenResolution),
        property('sessionNumber', data.sessionNumber),
        property('timezone', data.timezone),
        property('userAgent', data.userAgent),
        property('volume', data.volume),
        property('isCrawler', data.isCrawler),
      ),
      property('querystring', data.querystring),
      namespace('session')(property('sequenceNumber', data.sequenceNumber)),
      namespace('user')(property('visitorId', data.visitorId)),
    ),
  ) as GlobalData;
}

export default globalData;
