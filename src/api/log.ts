import type { Logs } from '@dto/log';

import Axios from '@library/axios';

const BASE_PATH = '/logs';

export async function postLog(params: Logs) {
  const response = await Axios.getInstance().post(BASE_PATH, { ...params });
  return response;
}
