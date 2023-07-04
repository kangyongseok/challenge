import { useEffect } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import amplitude from 'amplitude-js';
import { useQueryClient } from '@tanstack/react-query';

import type { FacebookLoginResponse } from '@dto/userAuth';

import { checkAgent } from '@utils/common';

import { activeMyFilterState } from '@recoil/productsFilter';
import { channelReceivedMessageFilteredState, sendbirdState } from '@recoil/channel';
import useSignOut from '@hooks/useSignOut';
import useSession from '@hooks/useSession';

function Logout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: accessUser } = useSession();
  const signOut = useSignOut();

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

    signOut().then(() => router.replace('/login'));
  }, [
    accessUser?.snsType,
    queryClient,
    router,
    resetSendbirdState,
    resetChannelReceivedMessageFilteredState,
    resetActiveMyFilterState,
    accessUser?.userId,
    signOut
  ]);

  return null;
}

export default Logout;
