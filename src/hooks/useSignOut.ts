import { useResetRecoilState } from 'recoil';
import amplitude from 'amplitude-js';
import { useQueryClient } from '@tanstack/react-query';

import type { AccessUser, FacebookLoginResponse } from '@dto/userAuth';

import Sendbird from '@library/sendbird';
import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import { deleteToken } from '@api/nextJs';

import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';

import { checkAgent } from '@utils/common';

import { activeMyFilterState } from '@recoil/productsFilter';
import { channelReceivedMessageFilteredState, sendbirdState } from '@recoil/channel';
import useSession from '@hooks/useSession';

export default function useSignOut() {
  const queryClient = useQueryClient();
  const { data: accessUser } = useSession();

  const resetSendbirdState = useResetRecoilState(sendbirdState);
  const resetChannelReceivedMessageFilteredState = useResetRecoilState(
    channelReceivedMessageFilteredState
  );
  const resetActiveMyFilterState = useResetRecoilState(activeMyFilterState);

  return async () => {
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

    await deleteToken(
      LocalStorage.get<string>(ACCESS_TOKEN) || '',
      LocalStorage.get<AccessUser>(ACCESS_USER) || {}
    );

    amplitude.getInstance().setUserId(null);
    LocalStorage.remove(ACCESS_USER);
    LocalStorage.remove(ACCESS_TOKEN);
    Axios.clearAccessToken();
    queryClient.clear();
    resetSendbirdState();
    resetChannelReceivedMessageFilteredState();
    resetActiveMyFilterState();
    await Sendbird.finalize();
  };
}
