import { useQuery } from '@tanstack/react-query';

import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import useSession from './useSession';

interface QueryProps {
  productId: number;
  includeLegit?: boolean;
  type?: number;
}

function useQueryProductOrder({ productId, includeLegit, type = 0 }: QueryProps) {
  const { isLoggedInWithSMS } = useSession();

  return useQuery(
    queryKeys.orders.productOrder({
      productId,
      isCreated: true,
      includeLegit,
      type
    }),
    () =>
      fetchProductOrder({
        productId,
        isCreated: true,
        includeLegit,
        type
      }),
    {
      enabled: isLoggedInWithSMS && !!productId && !Number.isNaN(type),
      refetchOnMount: true
    }
  );
}

export default useQueryProductOrder;
