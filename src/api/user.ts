import type {
  AgeAndGenderParams,
  AlarmsParams,
  Area,
  AreaParams,
  BanWordParams,
  BanWordResponse,
  CategoryWish,
  CategoryWishesParams,
  FixedChannelType,
  MyUserInfo,
  PageHoneyNoti,
  PageUserBlock,
  PageUserHistory,
  PageUserReview,
  PostAreaParams,
  PostReportData,
  PostReviewData,
  PostSize,
  PostStyleParams,
  PostSurveyData,
  PostTransferData,
  PostUserAccountData,
  PostUserDeliveryData,
  ProductKeywordData,
  ProductKeywords,
  ProductsAddParams,
  ProductsByUserIdParams,
  ProductsRemoveParams,
  PutUserLegitProfileData,
  SizeMapping,
  SizeResult,
  UpdateUserProfileData,
  UserAccount,
  UserBlockParams,
  UserCert,
  UserFixedChannel,
  UserHistoryManages,
  UserInfo,
  UserInfoResult,
  UserProductsParams,
  UserReviewsByUserIdParams,
  UserRoleLegit,
  UserRoleSeller,
  UserSizeSuggestParams,
  UserTransfer
} from '@dto/user';
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

export async function fetchAlarm() {
  const { data } = await Axios.getInstance().get<AlarmsParams>(`${BASE_PATH}/alarm`);

  return data;
}

export async function putAlarm(params: AlarmsParams) {
  await Axios.getInstance().put(`${BASE_PATH}/alarm`, params);
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
    shopDescription?: string;
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

export async function fetchMyUserInfo() {
  const { data } = await Axios.getInstance().get<MyUserInfo>(`${BASE_PATH}/myUserInfo`);

  return data;
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

export async function fetchBanword(params: BanWordParams) {
  const { data } = await Axios.getInstance().get<BanWordResponse>(`${BASE_PATH}/banword`, {
    params
  });

  return data;
}

export async function putProfile(data: UpdateUserProfileData) {
  await Axios.getInstance().put(`${BASE_PATH}/profile`, data);
}

export async function postSurvey(data: PostSurveyData) {
  await Axios.getInstance().post(`${BASE_PATH}/survey`, data);
}

export async function fetchTransfers() {
  const { data } = await Axios.getInstance().get<{
    userTransfers: UserTransfer[];
  }>(`${BASE_PATH}/transfers`);

  return data;
}

export async function fetchFixedChannel() {
  const { data } = await Axios.getInstance().get<UserFixedChannel[]>(`${BASE_PATH}/channel`);
  return data;
}

export async function postTransfers(data: PostTransferData) {
  await Axios.getInstance().post(`${BASE_PATH}/transfers`, data);
}

export async function fetchSurvey() {
  const { data } = await Axios.getInstance().get(`${BASE_PATH}/survey/4`);

  return data;
}

export async function putFixedChannel({
  type = 'channelDefaultMessage',
  value
}: {
  type: FixedChannelType;
  value: string;
}) {
  await Axios.getInstance().put(`${BASE_PATH}/channel`, {
    type,
    value
  });
}

export async function fetchUserAccounts() {
  const { data } = await Axios.getInstance().get<UserAccount[]>(`${BASE_PATH}/accounts`);
  return data;
}

export async function postUserDelivery(data: PostUserDeliveryData) {
  await Axios.getInstance().post(`${BASE_PATH}/delivery`, data);
}

export async function postUserAccount(data: PostUserAccountData) {
  const response = await Axios.getInstance().post<UserAccount>(`${BASE_PATH}/accounts`, data);

  return response.data;
}

export async function fetchUserCerts() {
  const { data } = await Axios.getInstance().get<UserCert[]>(`${BASE_PATH}/certs`);

  return data;
}

export async function postUserCerts(
  data: Partial<Pick<UserCert, 'name' | 'birth' | 'birthday' | 'ci' | 'di' | 'gender'>> & {
    type: 0;
  }
) {
  const response = await Axios.getInstance().post<UserCert>(`${BASE_PATH}/certs`, data);

  return response.data;
}
