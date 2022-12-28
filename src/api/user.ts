import type {
  AgeAndGenderParams,
  Area,
  AreaParams,
  CategoryWish,
  CategoryWishesParams,
  PageHoneyNoti,
  PageUserBlock,
  PageUserHistory,
  PageUserReview,
  PostAlarmData,
  PostAreaParams,
  PostReportData,
  PostReviewData,
  PostSize,
  PostStyleParams,
  ProductKeywordData,
  ProductKeywords,
  ProductsAddParams,
  ProductsByUserIdParams,
  ProductsRemoveParams,
  PutUserLegitProfileData,
  SizeMapping,
  SizeResult,
  UserBlockParams,
  UserHistoryManages,
  UserInfo,
  UserInfoResult,
  UserProductsParams,
  UserReviewsByUserIdParams,
  UserRoleLegit,
  UserSizeSuggestParams
} from '@dto/user';
import { UserRoleSeller } from '@dto/user';
import type { PageProductResult, ProductResult, UserPersonalStyleParams } from '@dto/product';

import Axios from '@library/axios';

import { convertQueryStringByObject } from '@utils/common';

const BASE_PATH = '/users';

export async function fetchUserInfo() {
  const { data } = await Axios.getInstance().get<UserInfoResult>(`${BASE_PATH}/userInfo`);

  return data;
}

export async function fetchSimpleUserInfo() {
  const { data } = await Axios.getInstance().get<UserInfoResult>(`${BASE_PATH}/simpleUserInfo`);

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

export async function postAlarm(data: PostAlarmData) {
  await Axios.getInstance().post(`${BASE_PATH}/alarm`, data);
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

export async function fetchUserHistory(params: { page: number; size?: number; type?: string }) {
  const { data } = await Axios.getInstance().get<PageUserHistory>('/userhistory', {
    params: {
      ...params,
      sort: 'dateCreated,DESC',
      size: params.size || 100,
      type: params.type || 'SE,PV'
    }
  });

  return data;
}

export async function fetchUserHoneyNoti() {
  const { data } = await Axios.getInstance().get<PageHoneyNoti>(
    '/userhoneynoti?size=200&sort=dateCreated,DESC'
  );

  return data;
}

export async function postProductKeyword(data: ProductKeywordData) {
  const { data: responseData } = await Axios.getInstance().post(
    `${BASE_PATH}/productKeyword`,
    data
  );

  return responseData;
}

export async function deleteProductKeyword(id: number) {
  const { data } = await Axios.getInstance().delete(`${BASE_PATH}/productKeyword/${id}`);

  return data;
}

export async function putProductKeyword(id: number) {
  const { data } = await Axios.getInstance().put(`${BASE_PATH}/productKeyword/${id}/restore`);

  return data;
}

export async function fetchProductKeywords() {
  const { data } = await Axios.getInstance().get<ProductKeywords>(`${BASE_PATH}/productKeywords`);

  return data;
}

export async function putProductKeywordView(id: number) {
  const { data } = await Axios.getInstance().put(`${BASE_PATH}/productKeyword/${id}/view`);

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

export async function postPreReserve(params: { phone?: string }) {
  await Axios.getInstance().post(`${BASE_PATH}/model${convertQueryStringByObject(params)}`);
}

export async function fetchUserLegitTargets() {
  const { data } = await Axios.getInstance().get<ProductResult[]>(`${BASE_PATH}/legitTargets`);

  return data;
}

export async function postLegitsFollow({ productId }: { productId: number }) {
  await Axios.getInstance().post(`${BASE_PATH}/legits/${productId}/follow`);
}

export async function fetchRecommWishes() {
  const { data } = await Axios.getInstance().get<ProductResult[]>(`${BASE_PATH}/recommWishes`);

  return data;
}

export async function fetchProductKeywordProducts(id: number) {
  const { data } = await Axios.getInstance().get<ProductResult[]>(
    `${BASE_PATH}/productKeywords/${id}/products`
  );

  return data;
}

export async function fetchUserProducts(params: UserProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(`${BASE_PATH}/products`, {
    params
  });

  return data;
}

export async function fetchLegitProfile(userId: number) {
  const { data } = await Axios.getInstance().get<{
    profile: UserRoleLegit;
    roleSeller: UserRoleSeller;
    cntOpinion: number;
  }>(`${BASE_PATH}/${userId}/legit/profile`);

  return data;
}

export async function putLegitProfile({ userId, ...data }: PutUserLegitProfileData) {
  const { data: responseData } = await Axios.getInstance().put<{
    id: number;
  }>(`${BASE_PATH}/${userId}/legit/profile`, data);

  return responseData;
}

export async function deleteWishSoldout() {
  await Axios.getInstance().delete(`${BASE_PATH}/wishes/undisplayed`);
}

export async function postUserStyle(params: UserPersonalStyleParams) {
  await Axios.getInstance().post(`${BASE_PATH}/style`, { ...params });
}

export async function fetchInfoByUserId(userId: number) {
  const { data } = await Axios.getInstance().get<UserInfo>(`${BASE_PATH}/${userId}/info`);

  return data;
}

export async function fetchProductsByUserId({ userId, ...params }: ProductsByUserIdParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(
    `${BASE_PATH}/${userId}/products`,
    {
      params
    }
  );

  return data;
}

export async function fetchReviewsByUserId({ userId, ...params }: UserReviewsByUserIdParams) {
  const { data } = await Axios.getInstance().get<PageUserReview>(`${BASE_PATH}/${userId}/reviews`, {
    params
  });

  return data;
}

export async function postReview({ userId, ...data }: PostReviewData) {
  await Axios.getInstance().post(`${BASE_PATH}/${userId}/reviews`, data);
}

export async function fetchBlocks(params: UserBlockParams) {
  const { data } = await Axios.getInstance().get<PageUserBlock>(`${BASE_PATH}/blocks`, {
    params
  });

  return data;
}

export async function postReviewBlock(reviewId: number) {
  await Axios.getInstance().post(`${BASE_PATH}/reviews/${reviewId}/block`);
}

export async function postReviewReport(reviewId: number) {
  await Axios.getInstance().post(`${BASE_PATH}/reviews/${reviewId}/report`);
}

export async function postBlock(userId: number) {
  await Axios.getInstance().post(`${BASE_PATH}/${userId}/block`);
}

export async function deleteBlock(userId: number) {
  await Axios.getInstance().delete(`${BASE_PATH}/${userId}/block`);
}

export async function postReport({ userId, ...data }: PostReportData) {
  await Axios.getInstance().post(`${BASE_PATH}/${userId}/report`, data);
}
