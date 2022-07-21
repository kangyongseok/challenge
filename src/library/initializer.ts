import type { QueryClient } from 'react-query';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

const Initializer = {
  initAccessTokenByCookies({ accessToken }: NextApiRequestCookies) {
    if (accessToken) Axios.setAccessToken(accessToken);
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
  }
};

export default Initializer;
