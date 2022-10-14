import type { ManageParams } from '@dto/userHistory';

import Axios from '@library/axios';

const BASE_PATH = '/userhistory';

export async function postManage(params: ManageParams) {
  await Axios.getInstance().post(`${BASE_PATH}/manage`, params);
}

export async function deleteWishRecent() {
  await Axios.getInstance().delete(`${BASE_PATH}`);
}
