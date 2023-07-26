import { useEffect, useState } from 'react';

import type { Order } from '@dto/order';

import getOrderStatus, { OrderStatus } from '@utils/common/getOrderStatus';

import useSession from '@hooks/useSession';

interface UseOrderStatusProps {
  order?: Order;
}

export default function useOrderStatus({ order }: UseOrderStatusProps) {
  const { data: accessUser } = useSession();

  const [isSeller, setIsSeller] = useState(order?.userId !== accessUser?.userId);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    getOrderStatus({ ...((order || {}) as Order), isSeller })
  );

  useEffect(() => {
    if (!order || !accessUser) return;

    setIsSeller(order?.userId !== accessUser?.userId);
  }, [order, accessUser]);

  useEffect(() => {
    if (!order) return;

    setOrderStatus(getOrderStatus({ ...order, isSeller }));
  }, [order, isSeller]);

  return orderStatus;
}
