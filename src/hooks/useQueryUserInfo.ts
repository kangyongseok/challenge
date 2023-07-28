import { useQuery } from '@tanstack/react-query';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

import useSession from '@hooks/useSession';

function useQueryUserInfo() {
  const { isLoggedInWithSMS } = useSession();

  return useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    refetchOnMount: true,
    enabled: isLoggedInWithSMS,
    cacheTime: Infinity,
    keepPreviousData: true
  });
}

export default useQueryUserInfo;
