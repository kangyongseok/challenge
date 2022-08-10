import type {
  LegitProductsParams,
  PageProduct,
  PageProductLegit,
  PageProductResult,
  ProductDetail,
  ProductLegit,
  ProductParams,
  RecommProductsParams,
  ReviewInfoParams,
  Search,
  SearchAiProductParams,
  SearchParams,
  SearchRelatedProductsParams,
  SellerProductsParams,
  SellerReportParams,
  SellerReview,
  SuggestKeyword
} from '@dto/product';

import Axios from '@library/axios';

const BASE_PATH = '/products';

export async function fetchProduct({ productId, ...params }: ProductParams) {
  const { data } = await Axios.getInstance().get<ProductDetail>(`${BASE_PATH}/${productId}`, {
    params
  });

  return data;
}

export async function fetchRelatedProducts(productId: number) {
  const { data } = await Axios.getInstance().get<PageProduct>(
    `${BASE_PATH}/${productId}/relatedProducts`
  );

  return data;
}

export async function fetchReviewInfo({ productId, ...params }: ReviewInfoParams) {
  const { data } = await Axios.getInstance().get<SellerReview>(
    `${BASE_PATH}/${productId}/reviewInfo`,
    {
      params
    }
  );

  return data;
}

export async function fetchSellerProducts({ productId, ...params }: SellerProductsParams) {
  const { data } = await Axios.getInstance().get<PageProduct>(
    `${BASE_PATH}/${productId}/sellerProducts`,
    {
      params
    }
  );

  return data;
}

export async function fetchKeywordsSuggest(value: string) {
  const { data } = await Axios.getInstance().get<SuggestKeyword[]>(
    `${BASE_PATH}/keywords/suggest?keyword=${value}`
  );
  return data;
}

export async function fetchSearch(params?: SearchParams) {
  const { data } = await Axios.getInstance().get<Search>(`${BASE_PATH}/search`, {
    params: {
      logging: true,
      ...params
    }
  });

  return data;
}

export async function fetchSearchOptions(params?: SearchParams) {
  const { data } = await Axios.getInstance().get<Search>(`${BASE_PATH}/search`, {
    params: {
      ...params,
      filter: 1
    }
  });

  return data;
}

export async function fetchSearchAiProduct(params?: SearchAiProductParams) {
  const { data: { products = [] } = {} } = await Axios.getInstance().get<{
    products: PageProduct[];
  }>(`${BASE_PATH}/searchAiProduct`, { params });

  return products[0];
}

export async function fetchSearchRelatedProducts(params?: SearchRelatedProductsParams) {
  const { data } = await Axios.getInstance().get<Search>(`${BASE_PATH}/searchRelatedProducts`, {
    params
  });

  return data;
}

export async function postSellerReport(params: SellerReportParams) {
  await Axios.getInstance().post(`${BASE_PATH}/sellerReport`, params);
}

export async function fetchProductLegit(productId: number) {
  const { data } = await Axios.getInstance().get<ProductLegit>(`${BASE_PATH}/${productId}/legit`);

  return data;
}

export async function postProductLegit({ id, deviceId }: { id: number; deviceId?: string }) {
  await Axios.getInstance().post(`${BASE_PATH}/${id}/legit`, {
    deviceId
  });
}

export async function fetchLegitProducts(params: LegitProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductLegit>(`${BASE_PATH}/legitProducts`, {
    params
  });

  return data;
}

export async function fetchRecommProducts(params?: RecommProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(`${BASE_PATH}/recommProducts`, {
    params
  });

  return data;
}
