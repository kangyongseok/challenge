// import { useCallback, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

// import LocalStorage from '@library/localStorage';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
// import { ACCESS_USER } from '@constants/localStorage';

import useQueryAccessUser from './useQueryAccessUser';

function useQueryMyUserInfo2() {
  const { data: accessUser } = useQueryAccessUser();
  const { data: myUserInfo, isFetched } = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo, {
    enabled: !!accessUser
  });

  // const updateLocalStorageAccessUser = useCallback(() => {
  //   const copyAccessUser = { ...accessUser };

  //   if ((accessUser?.userName || '') !== (myUserInfo?.info.value?.nickName || '')) {
  //     copyAccessUser.userName = myUserInfo?.info.value.nickName;
  //   }

  //   if (accessUser?.image !== myUserInfo?.info.value?.imageProfile) {
  //     copyAccessUser.image = myUserInfo?.info.value?.imageProfile;
  //   }
  //   console.log(copyAccessUser)
  //   // LocalStorage.set(ACCESS_USER, copyAccessUser);
  //   // refetch();
  // }, [
  //   accessUser,
  //   myUserInfo?.info?.value?.imageProfile,
  //   myUserInfo?.info?.value?.nickName,
  //   refetch
  // ]);

  // useEffect(() => {
  //   // updateLocalStorageAccessUser();
  // }, [myUserInfo, updateLocalStorageAccessUser]);

  return {
    ...myUserInfo,
    myUserInfoFetched: isFetched,
    userId: accessUser?.userId
  };
}

export default useQueryMyUserInfo2;
