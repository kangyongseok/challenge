import { UserSnsLoginInfo, UserSnsLoginResult } from '@dto/userAuth';

import Axios from '@library/axios';

import { ProductDealInfo } from '@typings/common';

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
