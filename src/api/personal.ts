import type { Base } from '@dto/personal';

import Axios from '@library/axios';

const BASE_PATH = '/personals';

export async function fetchBaseInfo(deviceId?: string | null) {
  const { data } = await Axios.getInstance().get<Base>(`${BASE_PATH}/baseInfo`, {
    params: {
      deviceId
    }
  });

  return data;
}
