import type {
  DeleteProductLegitCommentData,
  DeleteProductLegitOpinionData,
  OpinionLegitsParams,
  PageProductComment,
  PageProductLegit,
  PostProductLegitCommentData,
  PostProductLegitData,
  PostProductLegitOpinionData,
  PostProductLegitPreConfirmData,
  ProductLegit,
  ProductLegitCommentsParams,
  ProductLegits,
  ProductLegitsParams,
  PutProductLegitCommentData,
  PutProductLegitOpinionData
} from '@dto/productLegit';
import { PutProductLegitData } from '@dto/productLegit';

import Axios from '@library/axios';

const BASE_PATH = '/productlegits';

export async function fetchProductLegits(params: ProductLegitsParams) {
  const { data } = await Axios.getInstance().get<ProductLegits>(BASE_PATH, {
    params
  });

  return data;
}

export async function fetchProductLegit(productId: number) {
  const { data } = await Axios.getInstance().get<ProductLegit>(`${BASE_PATH}/${productId}`);

  return data;
}

export async function postProductLegit(data: PostProductLegitData) {
  const { data: responseData } = await Axios.getInstance().post<number>(BASE_PATH, data);

  return responseData;
}

export async function putProductLegit({ productId, ...data }: PutProductLegitData) {
  const { data: responseData } = await Axios.getInstance().put<number>(
    `${BASE_PATH}/${productId}`,
    data
  );

  return responseData;
}

export async function postProductLegitPreConfirmFail(productId: number) {
  const { data: responseData } = await Axios.getInstance().post<number>(
    `${BASE_PATH}/${productId}/preConfirmFail`
  );

  return responseData;
}

export async function postProductLegitPreConfirmEdit({
  productId,
  photoGuideIds
}: PostProductLegitPreConfirmData) {
  const { data: responseData } = await Axios.getInstance().post<number>(
    `${BASE_PATH}/${productId}/preConfirmEdit`,
    {
      photoGuideIds
    }
  );

  return responseData;
}

export async function postProductLegitPreConfirmEditDone({
  productId
}: PostProductLegitPreConfirmData) {
  const { data: responseData } = await Axios.getInstance().post<number>(
    `${BASE_PATH}/${productId}/preConfirmEditDone`
  );

  return responseData;
}

export async function fetchRequestProductLegits(params: ProductLegitsParams) {
  const { data } = await Axios.getInstance().get<{
    cntAuthenticating: number;
    cntAuthenticatingOpinion: number;
    cntAuthorized: number;
    cntPreConfirm: number;
    cntPreConfirmEdit: number;
    cntPreConfirmEditDone: number;
    productLegits: PageProductLegit;
  }>(`${BASE_PATH}/legits`, {
    params
  });

  return data;
}

export async function postRequestProductLegits({
  productIds,
  deviceId
}: {
  productIds: number[];
  deviceId?: string;
}) {
  await Axios.getInstance().post(`${BASE_PATH}/legits`, {
    productIds,
    deviceId
  });
}

export async function fetchOpinionLegits(params: OpinionLegitsParams) {
  const { data } = await Axios.getInstance().get<PageProductLegit>(`${BASE_PATH}/opinionLegits`, {
    params
  });

  return data;
}

export async function fetchMyProductLegits() {
  const { data } = await Axios.getInstance().get<PageProductLegit>(`${BASE_PATH}/myLegits`);

  return data;
}

export async function postProductLegitOpinion({ productId, ...data }: PostProductLegitOpinionData) {
  const { data: responseData } = await Axios.getInstance().post<number>(
    `${BASE_PATH}/${productId}/opinions`,
    data
  );

  return responseData;
}

export async function putProductLegitOpinion({
  productId,
  opinionId,
  ...data
}: PutProductLegitOpinionData) {
  const { data: responseData } = await Axios.getInstance().put<number>(
    `${BASE_PATH}/${productId}/opinions/${opinionId}`,
    data
  );

  return responseData;
}

export async function deleteProductLegitOpinion({
  productId,
  opinionId,
  ...data
}: DeleteProductLegitOpinionData) {
  const { data: responseData } = await Axios.getInstance().delete<number>(
    `${BASE_PATH}/${productId}/opinions/${opinionId}`,
    data
  );

  return responseData;
}

export async function postProductLegitComment({ productId, ...data }: PostProductLegitCommentData) {
  const { data: responseData } = await Axios.getInstance().post<number>(
    `${BASE_PATH}/${productId}/comments`,
    data
  );

  return responseData;
}

export async function putProductLegitComment({
  productId,
  commentId,
  ...data
}: PutProductLegitCommentData) {
  const { data: responseData } = await Axios.getInstance().put<number>(
    `${BASE_PATH}/${productId}/comments/${commentId}`,
    data
  );

  return responseData;
}

export async function deleteProductLegitComment({
  productId,
  commentId
}: DeleteProductLegitCommentData) {
  const { data: responseData } = await Axios.getInstance().delete<number>(
    `${BASE_PATH}/${productId}/comments/${commentId}`
  );

  return responseData;
}

export async function fetchProductLegitComments({
  productId,
  ...params
}: ProductLegitCommentsParams) {
  const { data } = await Axios.getInstance().get<PageProductComment>(
    `${BASE_PATH}/${productId}/comments`,
    {
      params
    }
  );

  return data;
}
