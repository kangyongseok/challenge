import type { QueryClient } from 'react-query';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { AmplitudeClient } from 'amplitude-js';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';
import ABTest from '@library/abTest';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER, UTM_PARAMS } from '@constants/localStorage';

import { getUtmParams } from '@utils/common';
import checkAgent from '@utils/checkAgent';

const Initializer = {
  initAccessTokenByCookies({ accessToken }: NextApiRequestCookies) {
    if (accessToken) {
      Axios.setAccessToken(accessToken);
    } else {
      Axios.clearAccessToken();
    }
  },
  initAccessUserInQueryClientByCookies(
    { accessUser }: NextApiRequestCookies,
    queryClient: QueryClient
  ) {
    if (accessUser) {
      queryClient.setQueryData(
        queryKeys.userAuth.accessUser(),
        JSON.parse(decodeURIComponent(accessUser))
      );
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
