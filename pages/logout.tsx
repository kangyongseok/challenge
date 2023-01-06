import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import amplitude from 'amplitude-js';

import type { FacebookLoginResponse } from '@dto/userAuth';

import Sendbird from '@library/sendbird';
import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import queryKeys from '@constants/queryKeys';
import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';

import { deleteCookie } from '@utils/cookies';
import { checkAgent } from '@utils/common';

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

    LocalStorage.remove(ACCESS_USER);
    LocalStorage.remove(ACCESS_TOKEN);
    queryClient.removeQueries(queryKeys.userAuth.accessUser(), { exact: true });
    queryClient.removeQueries(queryKeys.users.userInfo(), { exact: true });
    queryClient.removeQueries(queryKeys.users.categoryWishes({ deviceId }), { exact: true });
    Axios.clearAccessToken();
    deleteCookie('accessUser');
    deleteCookie('accessToken');
    resetSendbirdState();
    resetChannelReceivedMessageFilteredState();
    Sendbird.finalize();
    router.replace('/login');
  }, [
    accessUser?.snsType,
    queryClient,
    router,
    deviceId,
    resetSendbirdState,
    resetChannelReceivedMessageFilteredState,
    accessUser?.userId
  ]);

  return <div />;
}

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  deleteCookie('accessUser', { req, res });
  deleteCookie('accessToken', { req, res });

  return {
    props: {}
  };
}

export default Logout;
