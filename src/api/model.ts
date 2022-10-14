import type { ModelSuggestParams, Models } from '@dto/model';
import {
  LegitsBrand,
  LegitsBrandsParams,
  LegitsCategoriesParams,
  LegitsCategory,
  LegitsModelsParams,
  ModelLegit
} from '@dto/model';

import Axios from '@library/axios';

const BASE_PATH = '/models';

export async function fetchModelSuggest(params: ModelSuggestParams) {
  const { data } = await Axios.getInstance().get<Models[]>(`${BASE_PATH}/suggest`, {
    params
  });
  return data;
}

export async function fetchLegitsBrands(params?: LegitsBrandsParams) {
  const { data } = await Axios.getInstance().get<LegitsBrand[]>(`${BASE_PATH}/legits/brands`, {
    params
  });

  return data;
}

export async function fetchLegitsCategories(params?: LegitsCategoriesParams) {
  const { data } = await Axios.getInstance().get<LegitsCategory[]>(
    `${BASE_PATH}/legits/categories`,
    {
      params
    }
  );

  return data;
}
export async function fetchLegitsModels(params?: LegitsModelsParams) {
  const { data } = await Axios.getInstance().get<ModelLegit[]>(`${BASE_PATH}/legits/models`, {
    params
  });

  return data;
}
