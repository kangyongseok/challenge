import type {
  CamelProductsParams,
  PageProduct,
  PageProductResult,
  ProductDetail,
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

import type { SubmitType } from '@typings/camelSeller';

// import convertQueryStringByObject from '@utils/convertQueryStringByObject';

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

export async function fetchReviewInfo({ sellerId, ...params }: ReviewInfoParams) {
  const { data } = await Axios.getInstance().get<SellerReview>(
    `${BASE_PATH}/${sellerId}/reviewInfo`,
    {
      params
    }
  );

  return data;
}

export async function fetchSellerProducts({ sellerId, ...params }: SellerProductsParams) {
  const { data } = await Axios.getInstance().get<PageProduct>(
    `${BASE_PATH}/${sellerId}/sellerProducts`,
    {
      params
    }
  );

  return data;
}

export async function fetchKeywordsSuggest(keyword: string) {
  const { data } = await Axios.getInstance().get<SuggestKeyword[]>(
    `${BASE_PATH}/keywords/suggest`,
    { params: { keyword } }
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

export async function fetchSearchMeta(params?: SearchParams) {
  const { data } = await Axios.getInstance().get<Search>(`${BASE_PATH}/search`, {
    params: {
      ...params,
      isMeta: true
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

export async function fetchRecommProducts(params?: RecommProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(`${BASE_PATH}/recommProducts`, {
    params
  });

  return data;
}

export async function fetchCamelProducts(params: CamelProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(`${BASE_PATH}/camelProducts`, {
    params
  });

  return data;
}

export async function fetchSearchHistory(params?: SearchParams) {
  const { data } = await Axios.getInstance().get<Search>(`${BASE_PATH}/searchHistory`, {
    params
  });
  return data;
}

export async function putProductEdit({
  productId,
  parameter
}: {
  productId: number;
  parameter: SubmitType;
}) {
  await Axios.getInstance().put(`${BASE_PATH}/${productId}`, { ...parameter });
}

export async function putProductHoisting({ productId }: { productId: number }) {
  await Axios.getInstance().put(`${BASE_PATH}/${productId}/updatePosted`);
}

export async function putProductUpdateStatus({
  productId,
  status
}: {
  productId: number;
  status: number;
}) {
  await Axios.getInstance().put(`${BASE_PATH}/${productId}/updateStatus?status=${status}`);
}

export async function deleteProduct({ productId }: { productId: number }) {
  // ssesion 에 유저 아이디로 구분
  await Axios.getInstance().delete(`${BASE_PATH}/${productId}`);
}

export async function postProducts(parameter: SubmitType) {
  const { data } = await Axios.getInstance().post(`${BASE_PATH}`, { ...parameter });
  return data;
}
