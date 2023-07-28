import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

export default function useSession() {
  const query = useQuery(
    queryKeys.userAuth.accessUser(),
    () => LocalStorage.get<AccessUser>(ACCESS_USER),
    {
      refetchOnMount: true,
      cacheTime: Infinity,
      keepPreviousData: true
    }
  );

  const isLoggedIn = useMemo(() => !!query.data && query.data?.snsType !== 'sms', [query.data]);
  const isLoggedInWithSMS = useMemo(() => !!query.data, [query.data]);

  return {
    ...query,
    isLoggedIn,
    isLoggedInWithSMS
  };
}
