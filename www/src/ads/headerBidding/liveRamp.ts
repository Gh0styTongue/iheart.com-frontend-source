import buildScriptQueue from 'ads/utils/buildScriptQueue';

// LiveRamp programatic bidding requires the following to be true:
// 1. rubicon to be defined (and loaded) for pb.js integration
// 2. user is logged in (non anonymous)
// 3. user has an email (ie not a facebook login etc)

const { load } = buildScriptQueue({
  globalVar: 'ats',
  queueKey: null,
  scopedName: 'ats',
});

// Load LiveRamp
export const loadLiveRamp = (scriptUrl: string, email: any) => {
  return load(scriptUrl, () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    window.ats?.start({
      placementID: 2102,
      storageType: 'localStorage',
      logging: 'error',
      email: lowerCaseEmail,
    });
  });
};
