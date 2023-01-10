import { useEffect } from 'react';

import { useQuery } from 'react-query';

import { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

function useQueryMyUserInfo(enabled = true) {
  const { data: accessUser, refetch } = useQuery(queryKeys.userAuth.accessUser(), () =>
    LocalStorage.get<AccessUser>(ACCESS_USER)
  );
  const useQueryMyUserInfoResult = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo, {
    refetchOnMount: 'always',
    enabled: !!accessUser && enabled
  });

  // 닉네임 변경 후 accessUser data 반영 되지 않은 유저들 처리 추후 제거
  useEffect(() => {
    const updatedAccessUser = { ...accessUser };
    const userNickName = useQueryMyUserInfoResult.data?.info?.value?.nickName || '';
    const imageProfile = useQueryMyUserInfoResult.data?.info?.value?.imageProfile;
    const userImageProfile =
      (!imageProfile?.split('/').includes('0.png') && imageProfile) ||
      useQueryMyUserInfoResult.data?.info?.value?.image ||
      '';

    if (!!accessUser && (userNickName.length > 0 || userImageProfile.length > 0)) {
      if (accessUser.userName !== userNickName) updatedAccessUser.userName = userNickName;

      if (accessUser.image !== userImageProfile) updatedAccessUser.image = userImageProfile;

      LocalStorage.set(ACCESS_USER, updatedAccessUser);

      refetch();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useQueryMyUserInfoResult.data?.info?.value?.nickName]);

  return useQueryMyUserInfoResult;
}

export default useQueryMyUserInfo;
