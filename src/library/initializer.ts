import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { AmplitudeClient } from 'amplitude-js';
import type { QueryClient } from '@tanstack/react-query';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';
import ABTest from '@library/abTest';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER, UTM_PARAMS } from '@constants/localStorage';

import { checkAgent, getUtmParams } from '@utils/common';

const Initializer = {
  initAccessTokenByCookies({ accessToken }: NextApiRequestCookies) {
    if (accessToken) {
      Axios.setAccessToken(accessToken);
    } else {
      Axios.clearAccessToken();
    }
  },
  initAccessUserInQueryClient(queryClient: QueryClient) {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (accessUser) {
      queryClient.setQueryData(queryKeys.userAuth.accessUser(), accessUser);
    }
  },
  initAccessUserInAmplitude(amplitudeClient: AmplitudeClient) {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (!accessUser) return;

    const { userId, email, userName, snsType, area, gender, birthday, alarmAgree, adAgree } =
      accessUser;
    const properties = {
      userId,
      email,
      username: userName,
      sns_type: snsType,
      area,
      gender,
      birthday,
      alarm_agree: alarmAgree,
      ad_agree: adAgree
    };

    amplitudeClient.setUserProperties(properties);
  },
  initAccessUserInBraze() {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (!accessUser) return;

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callSetLoginUser) {
      window.webview.callSetLoginUser(JSON.stringify(accessUser));
    } else if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callSetLoginUser
    ) {
      window.webkit.messageHandlers.callSetLoginUser.postMessage(JSON.stringify(accessUser));
    }
  },
  initRum() {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

    if (!accessUser) return;

    datadogRum.init({
      applicationId: process.env.DATADOG_RUM_APP_ID,
      clientToken: process.env.DATADOG_RUM_CLIENT_TOKEN,
      site: 'datadoghq.com',
      service: process.env.DATADOG_RUM_SERVICE,
      env: process.env.DATADOG_RUM_ENV,
      sampleRate: 50,
      sessionReplaySampleRate: 20,
      trackInteractions: true,
      trackFrustrations: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'allow',
      allowedTracingOrigins: [process.env.DATADOG_ALLOWED_TRACING_ORIGIN]
    });

    const { userId, email, userName, snsType, area, gender, birthday, alarmAgree, adAgree } =
      accessUser;

    datadogLogs.init({
      clientToken: process.env.DATADOG_RUM_CLIENT_TOKEN,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sampleRate: 100,
      env: process.env.DATADOG_RUM_ENV,
      service: process.env.DATADOG_RUM_SERVICE
    });

    datadogRum.setUser({
      id: String(userId),
      name: userName,
      email,
      snsType,
      area,
      gender,
      birthday,
      alarmAgree,
      adAgree
    });

    datadogRum.startSessionReplayRecording();
  },
  initABTestIdentifierByCookie({ abTestIdentifier }: NextApiRequestCookies) {
    if (abTestIdentifier) {
      const taskNames = ABTest.getTasks().map(({ name }) => name);
      const parsedAbTestIdentifier = JSON.parse(abTestIdentifier);

      Object.keys(parsedAbTestIdentifier).forEach((key) => {
        if (!taskNames.includes(key)) {
          delete parsedAbTestIdentifier[key];
        }
      });

      ABTest.setIdentifier(parsedAbTestIdentifier);
    }
  },
  initUtmParams() {
    const utmParams = getUtmParams();

    if (Object.keys(utmParams).length) LocalStorage.set(UTM_PARAMS, utmParams);
  }
};

export default Initializer;
