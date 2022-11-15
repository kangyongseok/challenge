import type { ActivityNotiParams, ManageParams } from '@dto/userHistory';
import type { PageUserNoti } from '@dto/user';

import Axios from '@library/axios';

const BASE_PATH = '/userhistory';

export async function postManage(params: ManageParams) {
  await Axios.getInstance().post(`${BASE_PATH}/manage`, params);
}

export async function deleteWishRecent() {
  await Axios.getInstance().delete(`${BASE_PATH}`);
}

export async function fetchUserNoti(params: ActivityNotiParams) {
  const { data } = await Axios.getInstance().get<PageUserNoti>(`${BASE_PATH}/usernoti`, {
    params
  });

  return data;
}

export async function postNotiRead(params: { targetId: number; typeName: string }) {
  await Axios.getInstance().post(BASE_PATH, params);
}

export async function putNotiReadAll() {
  await Axios.getInstance().put(`${BASE_PATH}/notiReadAll`);
}
