import type { Order, OrderPaymentsData, OrderSearchParams, ProductOrderParams } from '@dto/order';
import type { Paged } from '@dto/common';

import Axios from '@library/axios';

const BASE_PATH = '/orders';

export async function fetchProductOrder({
  productId,
  isCreated,
  includeLegit,
  type
}: ProductOrderParams) {
  const { data } = await Axios.getInstance().get<Order>(`${BASE_PATH}/products/${productId}`, {
    params: {
      isCreated,
      type,
      includeLegit
    }
  });

  return data;
}

export async function fetchOrder(id: number) {
  const { data } = await Axios.getInstance().get<Order>(`${BASE_PATH}/${id}`);

  return data;
}

export async function fetchOrderSearch(params: OrderSearchParams) {
  const { data } = await Axios.getInstance().get<Paged<Order>>(`${BASE_PATH}/search`, {
    params
  });

  return data;
}

export async function postOrderPayments({ id, ...otherData }: OrderPaymentsData) {
  const { data } = await Axios.getInstance().post<Order>(`${BASE_PATH}/${id}/payments`, otherData);

  return data;
}

export async function putOrderConfirm(id: number) {
  const { data } = await Axios.getInstance().put<Order>(`${BASE_PATH}/${id}/confirm`);

  return data;
}

export async function putOrderApprove(id: number) {
  const { data } = await Axios.getInstance().put<Order>(`${BASE_PATH}/${id}/approve`);

  return data;
}

export async function putOrderRefuse({ id, reason }: { id: number; reason: string }) {
  const { data } = await Axios.getInstance().put<Order>(`${BASE_PATH}/${id}/refuse`, {
    reason
  });

  return data;
}

export async function postOrderCancel({ id, reason }: { id: number; reason?: string }) {
  const { data } = await Axios.getInstance().post<Order>(`${BASE_PATH}/${id}/cancel`, {
    reason
  });

  return data;
}

export async function putOrderCancel({
  id,
  reason,
  type
}: {
  id: number;
  reason?: string;
  type: 0 | 1;
}) {
  const { data } = await Axios.getInstance().put<Order>(`${BASE_PATH}/${id}/cancel`, {
    reason,
    type
  });

  return data;
}

export async function postOrderDelivery({
  id,
  ...request
}: {
  id: number;
  contents?: string;
  deliveryCode?: string;
  type?: 0 | 1 | 2 | 3; // 0: 직접입력 1 : 택배 2: 퀵 3: 용달
}) {
  await Axios.getInstance().post(`${BASE_PATH}/${id}/delivery`, request);
}
