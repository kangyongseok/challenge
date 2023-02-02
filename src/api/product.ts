import type {
  CamelProductsParams,
  PageProduct,
  PageProductResult,
  Product,
  ProductDetail,
  ProductParams,
  ProductResult,
  RecentSearchParams,
  RecommProductsParams,
  ReviewInfoParams,
  Search,
  SearchAiProductParams,
  SearchParams,
  SearchRelatedProductsParams,
  SellerInfo,
  SellerProductsParams,
  SellerReportParams,
  SellerReview,
  SuggestKeyword
} from '@dto/product';

import Axios from '@library/axios';

import { SearcgRelatedKeywordsParams, putProductUpdateStatusParams } from '@typings/products';
import type { SubmitType } from '@typings/camelSeller';

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
  const { data } = await Axios.getInstance().get<PageProductResult>(
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

export async function fetchSearchHistory(params?: SearchParams | RecentSearchParams) {
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
  ...params
}: putProductUpdateStatusParams) {
  await Axios.getInstance().put(`${BASE_PATH}/${productId}/updateStatus`, undefined, { params });
}

export async function deleteProduct({ productId }: { productId: number }) {
  // ssesion 에 유저 아ㅊ이디로 구분
  await Axios.getInstance().delete(`${BASE_PATH}/${productId}`);
}

export async function postProducts(parameter: SubmitType) {
  const { data } = await Axios.getInstance().post<Product>(`${BASE_PATH}`, parameter);
  return data;
}

export async function fetchRelatedKeywords(params: SearcgRelatedKeywordsParams) {
  const { data } = await Axios.getInstance().get(`${BASE_PATH}/searchRelatedKeywords`, { params });

  return data;
}

export async function fetchSellerInfo(sellerId: number) {
  const { data } = await Axios.getInstance().get<SellerInfo>(
    `${BASE_PATH}/sellers/${sellerId}/info`
  );

  return data;
}

export async function fetchProductList(productIds: number[]) {
  const { data } = await Axios.getInstance().get<ProductResult[]>(
    `${BASE_PATH}/list?productIds=${productIds.join(',')}`
  );

  return data;
}
