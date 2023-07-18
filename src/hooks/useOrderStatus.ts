import { useEffect, useState } from 'react';

import type { Order } from '@dto/order';

import getOrderStatus, { OrderStatus } from '@utils/common/getOrderStatus';

import useSession from '@hooks/useSession';

interface UseOrderStatusProps {
  order?: Order;
}

export default function useOrderStatus({ order }: UseOrderStatusProps) {
  const { data: accessUser } = useSession();

  const [isSeller, setIsSeller] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>({
    name: '',
    displayText: '',
    overlayText: '',
    description: '',
    transactionMethod: '',
    paymentMethod: '',
    stepperValues: [],
    isExpired: false,
    hasReview: false,
    orderDate: '',
    paymentDate: '',
    waitingSettlementDate: '',
    completeSettlementDate: '',
    isSeller: false
  });

  useEffect(() => {
    if (!order) return;

    setIsSeller(order?.userId !== accessUser?.userId);
  }, [order, accessUser]);

  useEffect(() => {
    if (!order) return;

    setOrderStatus(getOrderStatus({ ...order, isSeller }));
  }, [order, isSeller]);

  return orderStatus;
}
