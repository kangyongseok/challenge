import type {
  KaKaoAccount,
  OAuth2Response,
  UserSnsLoginInfo,
  UserSnsLoginResult
} from '@dto/userAuth';

import Axios from '@library/axios';

import { convertQueryStringByObject } from '@utils/common';

const BASE_PATH = '/userauth';

export async function postKakaoAccessToken(code: string) {
  const { data } = await Axios.getInstance().post<OAuth2Response>(
    'https://kauth.kakao.com/oauth/token',
    convertQueryStringByObject(
      {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_url: process.env.KAKAO_LOGIN_REDIRECT_URL,
        code
      },
      true
    )
  );

  return data;
}

export async function fetchKakaoAccount(accessToken: string) {
  const { data } = await Axios.getInstance().get<KaKaoAccount>(
    'https://kapi.kakao.com/v2/user/me',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return data;
}

export async function postLogin({
  deviceId,
  userSnsLoginInfo
}: {
  deviceId?: string;
  userSnsLoginInfo: UserSnsLoginInfo;
}) {
  const { data } = await Axios.getInstance().post<UserSnsLoginResult>(
    `${BASE_PATH}/login${convertQueryStringByObject({ deviceId })}`,
    {
      ...userSnsLoginInfo
    }
  );

  return data;
}

export async function postWithdraw() {
  await Axios.getInstance().post(`${BASE_PATH}/withdraw`);
}

export async function fetchDevLogin(userId: string) {
  const { data } = await Axios.getInstance().get<UserSnsLoginResult>(`/test/devlogin/${userId}`);

  return data;
}

export async function postRequest(phoneNumber: string) {
  const { data } = await Axios.getInstance().post<{
    userId: number;
  }>(`${BASE_PATH}/request`, {
    phoneNumber
  });

  return data;
}

export async function postAuthorize(data: { userId: number; authNumber: string }) {
  const response = await Axios.getInstance().post<UserSnsLoginResult>(
    `${BASE_PATH}/authorize`,
    data
  );

  return response.data;
}

export async function postDecrypt(secretKey: string) {
  const response = await Axios.getInstance().post<UserSnsLoginResult>(`${BASE_PATH}/decrypt`, {
    secretKey
  });

  return response.data;
}
