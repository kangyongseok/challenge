import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { fetchUserHistoryManages } from '@api/user';

import queryKeys from '@constants/queryKeys';

import useSession from '@hooks/useSession';

function useQueryUserHistoryManages() {
  const { isLoggedIn } = useSession();
  const [userHistoryManagesParams] = useState('VIEW_SEARCH_HELPER');

  return useQuery(
    queryKeys.users.userHistoryManages(userHistoryManagesParams),
    () => fetchUserHistoryManages(userHistoryManagesParams),
    { enabled: isLoggedIn }
  );
}

export default useQueryUserHistoryManages;
