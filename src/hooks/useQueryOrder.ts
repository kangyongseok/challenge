import { useQuery } from '@tanstack/react-query';

import { fetchOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import useSession from '@hooks/useSession';

interface UseQueryOrderProps {
  id: number;
}

export default function useQueryOrder({ id }: UseQueryOrderProps) {
  const { isLoggedInWithSMS } = useSession();

  return useQuery(queryKeys.orders.order(Number(id)), () => fetchOrder(Number(id)), {
    refetchOnMount: true,
    enabled: isLoggedInWithSMS && !!id
  });
}
