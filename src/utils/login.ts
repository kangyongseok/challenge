import type {
  AppleAccount,
  FacebookAccount,
  KaKaoAccount,
  KakaoAppAccount,
  UserSnsLoginInfo
} from '@dto/userAuth';

type KakaoLoginInfo = {
  accessToken: string;
  loginData: KaKaoAccount;
  provider: 'kakao';
};

type KakaoAppLoginInfo = {
  accessToken: string;
  loginData: KakaoAppAccount;
  provider: 'kakaoApp';
};

type FacebookLoginInfo = {
  accessToken: string;
  loginData: FacebookAccount;
  provider: 'facebook';
};

type AppleLoginInfo = {
  accessToken: string;
  loginData: AppleAccount;
  provider: 'apple';
};

export type ConvertUserSnsLoginInfoProps =
  | KakaoLoginInfo
  | KakaoAppLoginInfo
  | FacebookLoginInfo
  | AppleLoginInfo;

export function convertUserSnsLoginInfo({
  accessToken,
  loginData,
  provider
}: ConvertUserSnsLoginInfoProps) {
  let userSnsLoginInfo: UserSnsLoginInfo = {
    authInfo: {
      accessToken,
      tokenType: 'bearer'
    },
    provider
  };

  switch (provider) {
    case 'kakao': {
      const {
        profile: { nickname: nickName, profile_image_url: image },
        email,
        gender,
        age_range: ageRang,
        birthday
      } = loginData.kakao_account;

      userSnsLoginInfo = {
        ...userSnsLoginInfo,
        nickName,
        image,
        socialId: String(loginData.id),
        email,
        gender,
        ageRang,
        birthday
      };

      break;
    }
    case 'kakaoApp': {
      const {
        id,
        properties: { nickname: nickName, profile_image: image },
        kakao_account: { email, gender } = {}
      } = loginData;

      userSnsLoginInfo = {
        ...userSnsLoginInfo,
        provider: 'kakao',
        nickName,
        image,
        socialId: String(id),
        email,
        gender
      };

      break;
    }
    case 'facebook': {
      const { email, id, name, picture: { data: { url = '' } = {} } = {}, userID } = loginData;

      userSnsLoginInfo = {
        ...userSnsLoginInfo,
        nickName: name,
        image: url,
        socialId: userID || id,
        email
      };

      break;
    }
    case 'apple': {
      const { id, name, email } = loginData;

      userSnsLoginInfo = {
        ...userSnsLoginInfo,
        nickName: name,
        socialId: id,
        email
      };

      break;
    }
    default: {
      break;
    }
  }

  return userSnsLoginInfo;
}
