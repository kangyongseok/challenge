import type { PageProductResult } from '@dto/product';
import type {
  Base,
  GuideProducts,
  GuideProductsParams,
  PersonalProductsParams,
  RecommendProducts,
  RecommendProductsParams
} from '@dto/personal';

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

export async function fetchGuideProducts(params: GuideProductsParams) {
  const { data } = await Axios.getInstance().get<GuideProducts>(`${BASE_PATH}/guideProducts`, {
    params
  });

  return data;
}

export async function fetchRecommendProducts(params: RecommendProductsParams) {
  const { data } = await Axios.getInstance().get<RecommendProducts>(`${BASE_PATH}/recommProducts`, {
    params
  });

  return data;
}

export async function fetchPersonalProducts(params: PersonalProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(
    `${BASE_PATH}/personalProducts`,
    {
      params
    }
  );

  return data;
}

export async function fetchPersonalsSellerProducts() {
  const { data } = await Axios.getInstance().get<PageProductResult>(`${BASE_PATH}/sellerProducts`);

  return data;
}

export async function fetchGuideAllProducts() {
  const { data } = await Axios.getInstance().get<GuideProducts[]>(`${BASE_PATH}/guideAllProducts`);

  return data;
}
