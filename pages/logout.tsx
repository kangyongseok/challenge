import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import amplitude from 'amplitude-js';
import { useQueryClient } from '@tanstack/react-query';

import type { FacebookLoginResponse } from '@dto/userAuth';

import Sendbird from '@library/sendbird';
import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import { deleteToken } from '@api/nextJs';

import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';

import { checkAgent } from '@utils/common';

import { activeMyFilterState } from '@recoil/productsFilter';
import { deviceIdState } from '@recoil/common';
import { channelReceivedMessageFilteredState, sendbirdState } from '@recoil/channel';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Logout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const deviceId = useRecoilValue(deviceIdState);
  const { data: accessUser } = useQueryAccessUser();

  const resetSendbirdState = useResetRecoilState(sendbirdState);
  const resetChannelReceivedMessageFilteredState = useResetRecoilState(
    channelReceivedMessageFilteredState
  );
  const resetActiveMyFilterState = useResetRecoilState(activeMyFilterState);

  useEffect(() => {
    amplitude.getInstance().setUserId(null);

    if (accessUser?.snsType === 'facebook' && window.FB) {
      window.FB.getLoginStatus((response: FacebookLoginResponse) => {
        if (response.status === 'connected') window.FB.logout();
      });
    }

    if (accessUser?.userId) {
      if (checkAgent.isAndroidApp()) window.webview?.callSetLogoutUser?.(accessUser.userId);

      if (checkAgent.isIOSApp())
        window.webkit?.messageHandlers?.callSetLogoutUser?.postMessage?.(`${accessUser.userId}`);
    }

    deleteToken(LocalStorage.get<string>(ACCESS_TOKEN) || '').then(() => {
      LocalStorage.remove(ACCESS_USER);
      LocalStorage.remove(ACCESS_TOKEN);
      Axios.clearAccessToken();
      queryClient.clear();
      resetSendbirdState();
      resetChannelReceivedMessageFilteredState();
      resetActiveMyFilterState();
      Sendbird.finalize();
      router.replace('/login');
    });
  }, [
    accessUser?.snsType,
    queryClient,
    router,
    deviceId,
    resetSendbirdState,
    resetChannelReceivedMessageFilteredState,
    resetActiveMyFilterState,
    accessUser?.userId
  ]);

  return null;
}

export default Logout;
