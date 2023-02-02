import { useCallback } from 'react';

import { useQuery } from 'react-query';
import omit from 'lodash-es/omit';

import { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

import type { UserData } from '@typings/user';

function useQueryUserData() {
  const userId = LocalStorage.get<AccessUser>(ACCESS_USER)?.userId?.toString() || '';

  const useQueryResult = useQuery(
    queryKeys.userAuth.userData(),
    () => LocalStorage.get<UserData>(userId),
    {
      enabled: !!userId,
      refetchOnMount: true
    }
  );

  const set = useCallback(
    (data: Partial<UserData>) => {
      if (!userId) return;

      LocalStorage.set(userId, { ...useQueryResult.data, ...data });
    },
    [useQueryResult.data, userId]
  );

  const remove = useCallback(
    (key: string) => {
      if (!userId) return;

      LocalStorage.set(userId, omit(useQueryResult.data, key));
    },
    [useQueryResult.data, userId]
  );

  return {
    ...useQueryResult,
    set,
    remove
  };
}

export default useQueryUserData;
