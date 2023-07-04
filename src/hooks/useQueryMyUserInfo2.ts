import { useQuery } from '@tanstack/react-query';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

import useSession from '@hooks/useSession';

function useQueryMyUserInfo2() {
  const { isLoggedInWithSMS, data: accessUser } = useSession();
  const { data: myUserInfo, isFetched } = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo, {
    enabled: isLoggedInWithSMS
  });

  return {
    ...myUserInfo,
    myUserInfoFetched: isFetched,
    userId: accessUser?.userId
  };
}

export default useQueryMyUserInfo2;
