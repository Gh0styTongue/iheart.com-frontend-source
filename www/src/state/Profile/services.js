import composeRequest, {
  authHeaders,
  body,
  formBody,
  header,
  method,
  query,
  urlTagged,
} from 'api/helpers';

export function getProfileQuery({ ampUrl, opts = {}, profileId, sessionId }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/profile/${{ profileId }}/getProfile`,
    query({
      includePreferences: true,
      profileId,
      sessionId,
      ...opts,
    }),
    method('get'),
  )();
}

export function updateProfileQuery({
  ampUrl,
  profileId,
  sessionId,
  valuesToUpdate,
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/profile/updateProfile`,
    method('post'),
    formBody({
      profileId,
      sessionId,
      ...valuesToUpdate,
    }),
  )();
}

export function savePreferenceQuery({
  ampUrl,
  profileId,
  sessionId,
  key,
  value,
}) {
  let transformedValue = value;
  if (['share.profile', 'fb.publishing'].includes(key)) {
    transformedValue = value ? 1 : 0;
  }
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/profile/savePreference`,
    method('post'),
    formBody({
      name: key,
      profileId,
      sessionId,
      userPeriodDelimiterInPrefKeys: true,
      value: transformedValue,
    }),
  )();
}

export function getListenHistory({
  ampUrl,
  profileId,
  sessionId,
  userProfileId,
  limit,
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/history/${{
      userId: userProfileId || profileId,
    }}/getAll`,
    query({
      campaignId: 'foryou_favorites',
      numResults: limit,
      profileId,
      sessionId,
    }),
    method('get'),
  )();
}

export function getBillingHistory({ ampUrl, profileId, sessionId }) {
  return composeRequest(
    authHeaders(profileId, sessionId),
    urlTagged`${{ ampUrl }}/api/v3/subscription/external/recurly/invoices`,
    method('get'),
  )();
}

export function linkAlexaToIOSViaAmp({
  ampUrl,
  amazonAuthCode,
  redirectUri,
  profileId,
  sessionId,
}) {
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v3/profiles/alexa/accountLinking`,
    query({ amazonAuthCode, redirectUri }),
    authHeaders(profileId, sessionId),
  )();
}

export function savePrivacyPreferences({
  ampUrl,
  profileId,
  sessionId,
  complianceType,
  requestType,
  firstName,
  lastName,
  email,
  stateOfResidence,
}) {
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v3/privacy/requests`,
    authHeaders(profileId, sessionId),
    body({
      complianceType,
      requestType,
      profileId,
      lastName,
      firstName,
      email,
      stateOfResidence,
    }),
    header('Content-Type', 'application/json'),
  )();
}
