import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import LocalStorage from '@library/localStorage';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';
import { DEFAUT_BACKGROUND_IMAGE } from '@constants/common';

import { getUserName } from '@utils/user';
import { hasImageFile } from '@utils/common';

import useSession from '@hooks/useSession';

function useQueryMyUserInfo(enabled = true) {
  const { isLoggedInWithSMS, data: accessUser, refetch } = useSession();
  const useQueryMyUserInfoResult = useQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo, {
    refetchOnMount: true,
    enabled: isLoggedInWithSMS && enabled,
    cacheTime: Infinity,
    keepPreviousData: true
  });

  const { userId, userNickName, userImageProfile, userImageBackground } = useMemo(() => {
    const imageProfile = useQueryMyUserInfoResult.data?.info?.value?.imageProfile;
    const image = useQueryMyUserInfoResult.data?.info?.value?.image;
    const imageBackground = useQueryMyUserInfoResult.data?.info?.value?.imageBackground;
    const userImage =
      (hasImageFile(imageProfile) && imageProfile) ||
      (hasImageFile(image) && image) ||
      accessUser?.image ||
      '';

    return {
      userId: accessUser?.userId,
      userNickName: getUserName(
        useQueryMyUserInfoResult.data?.info?.value?.nickName ||
          useQueryMyUserInfoResult.data?.info?.value?.name ||
          accessUser?.userName,
        accessUser?.userId
      ),
      userImageProfile: userImage,
      userImageBackground:
        imageBackground || (userImage.length > 0 && userImage) || DEFAUT_BACKGROUND_IMAGE
    };
  }, [
    accessUser?.image,
    accessUser?.userId,
    accessUser?.userName,
    useQueryMyUserInfoResult.data?.info?.value?.image,
    useQueryMyUserInfoResult.data?.info?.value?.imageBackground,
    useQueryMyUserInfoResult.data?.info?.value?.imageProfile,
    useQueryMyUserInfoResult.data?.info?.value?.name,
    useQueryMyUserInfoResult.data?.info?.value?.nickName
  ]);

  // 닉네임 변경 후 accessUser data 반영 되지 않은 유저들 처리 추후 제거
  useEffect(() => {
    const nickName = useQueryMyUserInfoResult.data?.info?.value?.nickName || '';

    if (isLoggedInWithSMS && accessUser && (nickName.length > 0 || userImageProfile.length > 0)) {
      const updatedAccessUser = { ...accessUser };

      if (accessUser.userName !== nickName) updatedAccessUser.userName = nickName;

      if (accessUser.image && accessUser.image !== userImageProfile)
        updatedAccessUser.image = userImageProfile;

      LocalStorage.set(ACCESS_USER, updatedAccessUser);

      refetch();
    } else {
      refetch();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useQueryMyUserInfoResult.data?.info?.value?.nickName]);

  return {
    ...useQueryMyUserInfoResult,
    userNickName,
    userId,
    userImageProfile,
    userImageBackground
  };
}

export default useQueryMyUserInfo;
