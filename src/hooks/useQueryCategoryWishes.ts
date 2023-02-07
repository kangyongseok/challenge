import { useQuery } from '@tanstack/react-query';

import type { AccessUser } from '@dto/userAuth';
import type { CategoryWishesParams } from '@dto/user';

import LocalStorage from '@library/localStorage';

import { fetchCategoryWishes } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

function useQueryCategoryWishes(params?: CategoryWishesParams) {
  const { data: accessUser } = useQuery(queryKeys.userAuth.accessUser(), () =>
    LocalStorage.get<AccessUser>(ACCESS_USER)
  );

  return useQuery(queryKeys.users.categoryWishes(params), () => fetchCategoryWishes(params), {
    enabled: !!accessUser
  });
}

export default useQueryCategoryWishes;
