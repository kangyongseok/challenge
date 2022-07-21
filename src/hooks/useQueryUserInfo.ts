import { useQuery } from 'react-query';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

function useQueryUserInfo() {
  const { data: accessUser } = useQuery(queryKeys.userAuth.accessUser(), () =>
    LocalStorage.get<AccessUser>(ACCESS_USER)
  );

  return useQuery(queryKeys.users.userInfo(), fetchUserInfo, { enabled: !!accessUser });
}

export default useQueryUserInfo;
