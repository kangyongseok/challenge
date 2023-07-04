import type { AccessUser, UserSnsLoginInfo, UserSnsLoginResult } from '@dto/userAuth';

import Axios from '@library/axios';

import type { ProductDealInfo } from '@typings/common';

export async function postAuthLogin(params: {
  deviceId?: string;
  userSnsLoginInfo: UserSnsLoginInfo;
}) {
  const { data } = await Axios.getInstance().post<UserSnsLoginResult>(
    `${process.env.NEXT_JS_API_BASE_URL}/auth/login`,
    params
  );

  return data;
}

export async function fetchProductDealInfos() {
  const { data } = await Axios.getInstance().get<ProductDealInfo[]>(
    `${process.env.NEXT_JS_API_BASE_URL}/product/dealInfos`
  );

  return data;
}

export async function postDevLogin(params: { testUserId: string }) {
  const { data } = await Axios.getInstance().post<UserSnsLoginResult>(
    `${process.env.NEXT_JS_API_BASE_URL}/auth/devLogin`,
    params
  );

  return data;
}

export async function postToken(accessToken: string, accessUser: Partial<AccessUser>) {
  const { data } = await Axios.getInstance().post<string>(
    `${process.env.NEXT_JS_API_BASE_URL}/auth/token`,
    {
      accessToken,
      accessUser
    }
  );

  return data;
}

export async function deleteToken(accessToken: string, accessUser: Partial<AccessUser>) {
  const { data } = await Axios.getInstance().delete<string>(
    `${process.env.NEXT_JS_API_BASE_URL}/auth/token`,
    {
      data: {
        accessToken,
        accessUser
      }
    }
  );

  return data;
}
