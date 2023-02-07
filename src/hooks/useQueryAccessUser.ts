import { useQuery } from '@tanstack/react-query';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

export default function useQueryAccessUser() {
  return useQuery(
    queryKeys.userAuth.accessUser(),
    () => LocalStorage.get<AccessUser>(ACCESS_USER),
    {
      refetchOnMount: true
    }
  );
}
