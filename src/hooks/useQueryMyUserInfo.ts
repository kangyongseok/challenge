import { useEffect, useMemo } from 'react';

import { useQuery } from 'react-query';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';

import { getUserName } from '@utils/user';
import { hasImageFile } from '@utils/common';

function useQueryMyUserInfo(enabled = true) {
  const { data: accessUser, refetch } = useQuery(queryKeys.userAuth.accessUser(), () =>
    LocalStorage.get<AccessUser>(ACCESS_USER)
  );
  const useQueryMyUserInfoResult = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo, {
    refetchOnMount: 'always',
    enabled: !!accessUser && enabled
  });

  const { userId, userNickName } = useMemo(
    () => ({
      userId: accessUser?.userId,
      userNickName: getUserName(
        useQueryMyUserInfoResult.data?.info?.value?.nickName ||
          useQueryMyUserInfoResult.data?.info?.value?.name ||
          accessUser?.userName,
        accessUser?.userId
      )
    }),
    [
      accessUser?.userId,
      accessUser?.userName,
      useQueryMyUserInfoResult.data?.info?.value?.name,
      useQueryMyUserInfoResult.data?.info?.value?.nickName
    ]
  );

  // 닉네임 변경 후 accessUser data 반영 되지 않은 유저들 처리 추후 제거
  useEffect(() => {
    const updatedAccessUser = { ...accessUser };
    const nickName = useQueryMyUserInfoResult.data?.info?.value?.nickName || '';
    const imageProfile = useQueryMyUserInfoResult.data?.info?.value?.imageProfile;
    const image = useQueryMyUserInfoResult.data?.info?.value?.image;
    const userImageProfile =
      (hasImageFile(imageProfile) && imageProfile) || (hasImageFile(image) && image) || '';

    if (!!accessUser && (nickName.length > 0 || userImageProfile.length > 0)) {
      if (accessUser.userName !== nickName) updatedAccessUser.userName = nickName;

      if (accessUser.image && accessUser.image !== userImageProfile)
        updatedAccessUser.image = userImageProfile;

      LocalStorage.set(ACCESS_USER, updatedAccessUser);

      refetch();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useQueryMyUserInfoResult.data?.info?.value?.nickName]);

  return { ...useQueryMyUserInfoResult, userNickName, userId };
}

export default useQueryMyUserInfo;
