import type {
  AgeAndGenderParams,
  Area,
  AreaParams,
  CategoryWish,
  CategoryWishesParams,
  PageHoneyNoti,
  PageUserHistory,
  PageUserNoti,
  PostAreaParams,
  PostSize,
  PostStyleParams,
  ProductKeywordData,
  ProductKeywords,
  ProductsAddParams,
  ProductsRemoveParams,
  SizeMapping,
  SizeResult,
  UserHistoryManages,
  UserInfo,
  UserSizeSuggestParams
} from '@dto/user';
import type { PageProductLegit, Product } from '@dto/product';

import Axios from '@library/axios';
import Amplitude from '@library/amplitude';

const BASE_PATH = '/users';

export async function fetchUserInfo() {
  const { data } = await Axios.getInstance().get<UserInfo>(`${BASE_PATH}/userInfo`);
  return data;
}

export async function fetchCategoryWishes(params?: CategoryWishesParams) {
  const { data } = await Axios.getInstance().get<CategoryWish>(`${BASE_PATH}/categoryWishes`, {
    params
  });

  return data;
}

export async function postNightAlarm(isNightAlarm: boolean) {
  await Axios.getInstance().post(`${BASE_PATH}/userNightAlarm`, {
    isNightAlarm
  });
}

export async function postAlarm(isAlarm: boolean) {
  await Axios.getInstance().post(`${BASE_PATH}/alarm`, { isAlarm });
}

export async function postProductsAdd({ productId, ...params }: ProductsAddParams) {
  await Axios.getInstance().post(`${BASE_PATH}/products/${productId}/add`, params);
}

export async function postProductsRemove({ productId, ...params }: ProductsRemoveParams) {
  await Axios.getInstance().post(`${BASE_PATH}/products/${productId}/remove`, params);
}

export async function postUserSize(params: PostSize) {
  await Axios.getInstance().post(`${BASE_PATH}/size`, params);
}

export async function fetchUserSizeSuggest(params: UserSizeSuggestParams) {
  const { data } = await Axios.getInstance().get<SizeResult[]>(`${BASE_PATH}/sizeSuggest`, {
    params
  });

  return data;
}

export async function postUserAgeAndGender(params: AgeAndGenderParams) {
  await Axios.getInstance().post(`${BASE_PATH}/ageAndGender`, params);
}

export async function postUserBudget(price: number) {
  await Axios.getInstance().post(`${BASE_PATH}/maxMoney`, { price });
}

export async function postStyle({ styleIds, ...params }: PostStyleParams) {
  const { data } = await Axios.getInstance().post(`${BASE_PATH}/style`, {
    // from CamelWebApp: '기본 온보딩 완료 여부를 구분하는 값'
    styleIds: styleIds || [36],
    ...params
  });

  return data;
}

export async function fetchArea(params: AreaParams) {
  const { data } = await Axios.getInstance().get<Area>(`${BASE_PATH}/area`, { params });

  return data;
}

export async function postArea(params: PostAreaParams) {
  await Axios.getInstance().post(`${BASE_PATH}/area`, params);
}

export async function fetchUserHistory(parameter: { page: number }) {
  const { data } = await Axios.getInstance().get<PageUserHistory>(
    `/userhistory?page=${parameter.page}&size=100&sort=dateCreated,DESC&type=SE,PV`
  );

  return data;
}

export async function fetchUserHoneyNoti() {
  const { data } = await Axios.getInstance().get<PageHoneyNoti>(
    '/userhoneynoti?size=200&sort=dateCreated,DESC'
  );

  return data;
}

export async function postWishProduct(parameter: { type: 'add' | 'remove'; productId: number }) {
  const deviceId = Amplitude.getClient()?.getDeviceId() ?? '';
  await Axios.getInstance().post<void>(
    `${BASE_PATH}/products/${parameter.productId}/${parameter.type}?deviceId=${deviceId}`
  );
}

export async function fetchUserNoti(type: number) {
  const { data } = await Axios.getInstance().get<PageUserNoti>(
    `/userhistory/usernoti?size=100&sort=dateCreated,DESC&type=${type}`
  );

  return data;
}

export async function postProductKeyword(data: ProductKeywordData) {
  const { data: responseData } = await Axios.getInstance().post('/users/productKeyword', data);

  return responseData;
}

export async function deleteProductKeyword(id: number) {
  const { data } = await Axios.getInstance().delete(`/users/productKeyword/${id}`);

  return data;
}

export async function putProductKeyword(id: number) {
  const { data } = await Axios.getInstance().put(`/users/productKeyword/${id}/restore`);

  return data;
}

export async function fetchProductKeywords() {
  const { data } = await Axios.getInstance().get<ProductKeywords>(`${BASE_PATH}/productKeywords`);

  return data;
}

export async function putProductKeywordView(id: number) {
  const { data } = await Axios.getInstance().put(`/users/productKeyword/${id}/view`);

  return data;
}

export async function fetchUserHistoryManages(event: string) {
  const { data } = await Axios.getInstance().get<UserHistoryManages>(
    `${BASE_PATH}/userHistoryManages?event=${event}`
  );

  return data;
}

export async function fetchSizeMapping() {
  const { data } = await Axios.getInstance().get<SizeMapping>(`${BASE_PATH}/sizeMapping`);

  return data;
}

export async function fetchUserLegitTargets() {
  const { data } = await Axios.getInstance().get<Product[]>(`${BASE_PATH}/legitTargets`);

  return data;
}

export async function fetchUserLegitProducts() {
  const { data } = await Axios.getInstance().get<PageProductLegit>(`${BASE_PATH}/legitProducts`);

  return data;
}

export async function postLegitsFollow({ productId }: { productId: number }) {
  await Axios.getInstance().post(`${BASE_PATH}/legits/${productId}/follow`);
}
