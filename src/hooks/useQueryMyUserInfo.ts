import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

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
        imageBackground ||
        (userImage.length > 0 && userImage) ||
        `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`
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
    const updatedAccessUser = { ...accessUser };
    const nickName = useQueryMyUserInfoResult.data?.info?.value?.nickName || '';

    if (!!accessUser && (nickName.length > 0 || userImageProfile.length > 0)) {
      if (accessUser.userName !== nickName) updatedAccessUser.userName = nickName;

      if (accessUser.image && accessUser.image !== userImageProfile)
        updatedAccessUser.image = userImageProfile;

      LocalStorage.set(ACCESS_USER, updatedAccessUser);

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
