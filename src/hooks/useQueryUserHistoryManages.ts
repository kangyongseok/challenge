import { useState } from 'react';

import { useQuery } from 'react-query';

import { fetchUserHistoryManages } from '@api/user';

import queryKeys from '@constants/queryKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function useQueryUserHistoryManages() {
  const { data: accessUser } = useQueryAccessUser();
  const [userHistoryManagesParams] = useState('VIEW_SEARCH_HELPER');

  return useQuery(
    queryKeys.users.userHistoryManages(userHistoryManagesParams),
    () => fetchUserHistoryManages(userHistoryManagesParams),
    { enabled: !!accessUser }
  );
}

export default useQueryUserHistoryManages;
