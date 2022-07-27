import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';

import type { FacebookLoginResponse } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';
import Amplitude from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';

import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Logout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const deviceId = useRecoilValue(deviceIdState);
  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    Amplitude.getClient().setUserId(null);

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
    router.replace('/login');
  }, [accessUser?.snsType, queryClient, router, deviceId]);

  return <div />;
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  res.setHeader('Set-Cookie', [
    `accessUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly;${
      process.env.NODE_ENV !== 'development' ? ' domain=.mrcamel.co.kr;' : ''
    }`,
    `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly;${
      process.env.NODE_ENV !== 'development' ? 'domain=domain=.mrcamel.co.kr;' : ''
    }`
  ]);

  return {
    props: {}
  };
}

export default Logout;
