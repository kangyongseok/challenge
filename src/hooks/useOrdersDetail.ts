import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { fetchOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import getOrderStatus, { OrderStatus } from '@utils/common/getOrderStatus';

import useSession from '@hooks/useSession';

interface UseOrdersDetailProps {
  id: number;
}

export default function useOrdersDetail({ id }: UseOrdersDetailProps) {
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
    completeSettlementDate: ''
  });

  const { isLoggedInWithSMS, data: accessUser } = useSession();

  const query = useQuery(queryKeys.orders.order(Number(id)), () => fetchOrder(Number(id)), {
    refetchOnMount: true,
    enabled: isLoggedInWithSMS && !!id
  });

  useEffect(() => {
    setIsSeller(query.data?.userId !== accessUser?.userId);
  }, [query.data?.userId, accessUser]);

  useEffect(() => {
    if (!query.data) return;

    setOrderStatus(getOrderStatus({ ...query.data, isSeller }));
  }, [query.data, isSeller]);

  return {
    ...query,
    orderStatus,
    isSeller
  };
}
