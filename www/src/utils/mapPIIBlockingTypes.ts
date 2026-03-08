import { mergeWith } from 'lodash-es';

export default function mapPIIBlockingTypes(piiBlockingTypes: Array<string>) {
  return mergeWith(
    {
      sanitizeAds: false,
      sanitizeStreams: false,
      turnOffAndo: false,
      turnOffOutbrain: false,
    },
    ...piiBlockingTypes.map(type => {
      switch (type) {
        case 'CCPA':
          return {
            sanitizeAds: true,
            sanitizeStreams: true,
            turnOffAndo: true,
            turnOffOutbrain: true,
          };
        case 'GDPR':
          // placeholder until we start worrying about the EU
          return {};
        default:
          return {};
      }
    }),
    (resValue: boolean, nextValue: boolean) => resValue || nextValue,
  );
}
