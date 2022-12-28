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

    LocalStorage.remove(ACCESS_USER);
    LocalStorage.remove(ACCESS_TOKEN);
    queryClient.removeQueries(queryKeys.userAuth.accessUser(), { exact: true });
    queryClient.removeQueries(queryKeys.users.userInfo(), { exact: true });
    queryClient.removeQueries(queryKeys.users.categoryWishes({ deviceId }), { exact: true });
    Axios.clearAccessToken();
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
    resetChannelReceivedMessageFilteredState
  ]);

  return <div />;
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  res.setHeader('Set-Cookie', [
    `accessUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly;${
      process.env.NODE_ENV !== 'development' ? ' domain=.mrcamel.co.kr;' : ''
    }`,
    `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly;${
      process.env.NODE_ENV !== 'development' ? ' domain=.mrcamel.co.kr;' : ''
    }`
  ]);

  return {
    props: {}
  };
}

export default Logout;
