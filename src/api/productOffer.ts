import type { PostProductOfferData } from '@dto/productOffer';

import Axios from '@library/axios';

const BASE_PATH = '/productoffers';

export async function postProductOffer({ productId, ...data }: PostProductOfferData) {
  const response = await Axios.getInstance().post<{
    channelId: number;
  }>(`${BASE_PATH}/products/${productId}`, data);

  return response.data;
}

export async function deleteProductOfferCancel(id: number) {
  await Axios.getInstance().delete(`${BASE_PATH}/${id}/cancel`);
}

export async function putProductOfferApprove(id: number) {
  await Axios.getInstance().put(`${BASE_PATH}/${id}/approve`);
}

export async function putProductOfferRefuse(id: number) {
  await Axios.getInstance().put(`${BASE_PATH}/${id}/refuse`);
}
