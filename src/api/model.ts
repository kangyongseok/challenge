import type { Models } from '@dto/model';

import Axios from '@library/axios';

import type { ModelParams } from '@typings/camelSeller';

const BASE_PATH = '/models';

export async function fetchModelSuggest(params: ModelParams) {
  const { data } = await Axios.getInstance().get<Models[]>(`${BASE_PATH}/suggest`, {
    params
  });
  return data;
}
