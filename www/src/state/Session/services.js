import composeRequest, {
  authHeaders,
  body,
  formBody,
  hostHeaders,
  method,
  transformRequest,
  unauthorizedInterceptorTransform,
  urlTagged,
} from 'api/helpers';
import qs from 'qs';

export function login({
  ampUrl,
  deviceId,
  deviceName,
  host,
  password,
  userName,
}) {
  return composeRequest(
    hostHeaders(host),
    urlTagged`${{ ampUrl }}/api/v1/account/login`,
    formBody({
      deviceId,
      deviceName,
      host,
      password,
      userName,
    }),
    method('post'),
  )();
}

export function loginRegSync({ ampUrl, deviceName, token, host, deviceId }) {
  return composeRequest(
    hostHeaders(host),
    urlTagged`${{ ampUrl }}/api/v1/account/loginWithShortLivedToken`,
    method('post'),
    formBody({
      deviceId,
      deviceName,
      host,
      token,
    }),
  )();
}

export function getRegSyncToken({ ampUrl, profileId, sessionId }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/session/token/${{ profileId }}`,
    method('post'),
    authHeaders(profileId, sessionId),
  )();
}

export function createUser({ ampUrl, deviceName, host, params, deviceId }) {
  return composeRequest(
    hostHeaders(host),
    urlTagged`${{ ampUrl }}/api/v1/account/createUser`,
    method('post'),
    formBody({
      deviceId,
      deviceName,
      host,
      ...params,
      termsAcceptanceData: Date.now(),
    }),
  )();
}

export function loginCreateOauth({
  ampUrl,
  host,
  email,
  accessToken,
  oauthUid,
  deviceId,
  deviceName,
  longProfileId,
  provider = 'fb',
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/loginOrCreateOauthUser`,
    method('post'),
    formBody({
      accessToken,
      accessTokenType: provider,
      deviceId,
      deviceName,
      host,
      longProfileId,
      oauthUuid: oauthUid,
      userName: email,
    }),
  )();
}

export function updateOauthCred({
  ampUrl,
  profileId,
  sessionId,
  accessToken,
  accessTokenType,
  uid,
  useUnauthorizedInterceptor = true,
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/updateOauthCred`,
    method('post'),
    formBody({
      accessToken,
      accessTokenType,
      oauthUuid: uid,
      profileId,
      sessionId,
    }),
    unauthorizedInterceptorTransform(useUnauthorizedInterceptor),
  )();
}

export function upgradeAnonAccount({
  ampUrl,
  deviceName,
  host,
  params,
  deviceId,
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/upgradeAnonAccount`,
    method('post'),
    formBody({
      deviceId,
      deviceName,
      host,
      ...params,
      termsAcceptanceDate: Date.now(),
    }),
  )();
}

export function setEmailAndPassword({
  ampUrl,
  profileId,
  sessionId,
  username,
  password,
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/setEmailCred `,
    method('post'),
    formBody({
      username,
      password,
      profileId,
      sessionId,
    }),
  )();
}

export function changeEmail({
  ampUrl,
  profileId,
  sessionId,
  newEmail,
  password,
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/changeEmail`,
    method('post'),
    formBody({
      newEmail,
      password,
      profileId,
      sessionId,
    }),
  )();
}

export function updatePw({ ampUrl, newPw, oldPw, profileId, sessionId }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/updatePw`,
    method('post'),
    formBody({
      newPw,
      oldPw,
      profileId,
      sessionId,
    }),
  )();
}

export function setNewPw({ ampUrl, profileId, accessToken, pwd }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/setNewPw`,
    method('post'),
    formBody({
      accessToken,
      password: pwd,
      profileId,
    }),
  )();
}

export function removeOauthCred({ ampUrl, profileId, sessionId, provider }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/account/removeOauthCred`,
    method('post'),
    formBody({
      accessTokenType: provider,
      profileId,
      sessionId,
    }),
  )();
}

const ampRequest = composeRequest(
  method('post'),
  transformRequest(qs.stringify),
);

export function ampResetPwRequest(ampUrl, email, includeLogin, redirectUrl) {
  return composeRequest(
    ampRequest,
    urlTagged`${{ ampUrl }}/api/v1/account/generateResetPwEmail`,
    body({
      includeLogin,
      redirectUrl,
      userName: email,
    }),
  );
}
