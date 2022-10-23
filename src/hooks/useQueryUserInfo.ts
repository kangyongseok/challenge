import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

function useQueryUserInfo() {
  const router = useRouter();
  const { data: accessUser } = useQuery(queryKeys.userAuth.accessUser(), () =>
    LocalStorage.get<AccessUser>(ACCESS_USER)
  );

  return useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    refetchOnMount: true,
    onSuccess: (data) => {
      // 임시처리, 조만간 제거 예정
      if (router.pathname !== '/')
        logEvent(attrKeys.debug.LOAD_USER_INFO, {
          ...data,
          ...window.location
        });
    },
    enabled: !!accessUser
  });
}

export default useQueryUserInfo;
