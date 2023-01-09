import { useQuery } from 'react-query';

import { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

function useQueryMyUserInfo(enabled = true) {
  const { data: accessUser } = useQuery(queryKeys.userAuth.accessUser(), () =>
    LocalStorage.get<AccessUser>(ACCESS_USER)
  );

  return useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo, {
    refetchOnMount: 'always',
    enabled: !!accessUser && enabled
  });
}

export default useQueryMyUserInfo;
