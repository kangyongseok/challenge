export interface OAuth2Response {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

export interface KaKaoAccount {
  id: number;
  connected_at: string;
  synched_at: string;
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean;
    };
    name_needs_agreement?: boolean;
    name?: string;
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
    has_age_range: boolean;
    age_range_needs_agreement: boolean;
    age_range?: string;
    has_birthyear: boolean;
    birthday_needs_agreement: boolean;
    birthday?: string;
    gender_needs_agreement: boolean;
    gender?: string;
  };
  properties: {
    nickname: string;
    profile_image: string;
    thumbnail_image: string;
    [key: string]: string;
  };
}

export interface UserSnsLoginInfo {
  authInfo: {
    accessToken: string;
    expiresIn?: number;
    refreshToken?: string;
    tokenType?: 'bearer';
  };
  ageRang?: string;
  birthday?: string;
  email?: string;
  gender?: string;
  image?: string;
  loginIp?: string;
  mrcamelId?: string;
  nickName?: string;
  provider?: string;
  socialId?: string;
}

export interface AccessUser {
  adAgree: boolean;
  age: string;
  ageRange: string;
  alarmAgree: boolean;
  area: string;
  birthday: string;
  email: string;
  gender: string;
  image: string;
  mrcamelId: string;
  snsType: string;
  userAuthStatus: boolean;
  userId: number;
  userName: string;
}

export interface UserSnsLoginResult {
  accessUser: AccessUser;
  jwtToken: string;
}

export interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  loginSource: string;
  authResponse: {
    accessToken: string;
    data_access_expiration_time: number;
    expiresIn: number;
    graphDomain: string;
    reauthorize_required_in?: string;
    signedRequest: string;
    userID: string;
  };
}

export interface KakaoAppAccount {
  access_token: string;
  expires_in: string;
  id: number;
  kakao_account?: {
    email: string;
    gender?: string;
  };
  properties: {
    nickname: string;
    profile_image: string;
  };
  token_type: string;
}

export interface FacebookAccount {
  accessToken: string;
  data_access_expiration_time: number;
  email?: string;
  expiresIn: number;
  graphDomain: string;
  id: string;
  name: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
  signedRequest: string;
  userID?: string; // 브릿지 호출하여 로그인한 경우
}

export interface AppleAccount {
  id: string;
  name?: string;
  email?: string;
  access_token: string;
}
