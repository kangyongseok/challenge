import type { Sns } from '@dto/user';

import { DEFAUT_BACKGROUND_IMAGE } from '@constants/common';

import { hasImageFile } from '@utils/common';

import useQueryMyUserInfo2 from './useQueryMyUserInfo2';

type PickNull<T, K extends keyof T> = { [P in K]: null };
type MyProfileInfo = {
  userId?: number;
  snsType?: Sns;
  nickName: string;
  profileImage: string;
  backgroundImage: string;
  isLegit: boolean;
  isCertifiedSeller?: boolean;
};
type MyProfileInfoNull = PickNull<MyProfileInfo, keyof MyProfileInfo>;

function useMyProfileInfo(): MyProfileInfo | MyProfileInfoNull {
  const {
    roles,
    info: myUserInfo,
    isCertifiedSeller,
    userId,
    myUserInfoFetched
  } = useQueryMyUserInfo2();

  const originSnsProfileImage = hasImageFile(myUserInfo?.value.image)
    ? myUserInfo?.value.image
    : '';
  const settingProfileImage = hasImageFile(myUserInfo?.value.imageProfile)
    ? myUserInfo?.value.imageProfile
    : '';

  if (!myUserInfoFetched) {
    return {
      userId: null,
      snsType: null,
      nickName: null,
      profileImage: null,
      backgroundImage: null,
      isLegit: null
    };
  }

  return {
    userId,
    snsType: myUserInfo?.value.snsType,
    nickName: myUserInfo?.value.nickName || myUserInfo?.value.name || `회원${userId}`,
    profileImage: settingProfileImage || originSnsProfileImage || '',
    backgroundImage:
      (hasImageFile(myUserInfo?.value.imageBackground) ? myUserInfo?.value.imageBackground : '') ||
      settingProfileImage ||
      originSnsProfileImage ||
      DEFAUT_BACKGROUND_IMAGE,
    isLegit: !!(roles?.includes('PRODUCT_LEGIT') || roles?.includes('PRODUCT_LEGIT_HEAD')),
    isCertifiedSeller
  };
}

export default useMyProfileInfo;
