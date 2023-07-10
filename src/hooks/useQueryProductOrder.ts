import { useQuery } from '@tanstack/react-query';

import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import useSession from './useSession';

interface QueryProps {
  productId: number;
  includeLegit?: boolean;
}

function useQueryProductOrder({ productId, includeLegit }: QueryProps) {
  const { isLoggedInWithSMS } = useSession();

  return useQuery(
    queryKeys.orders.productOrder({
      productId,
      isCreated: true,
      includeLegit
    }),
    () =>
      fetchProductOrder({
        productId,
        isCreated: true,
        includeLegit
      }),
    {
      enabled: isLoggedInWithSMS && !!productId,
      refetchOnMount: true
    }
  );
}

export default useQueryProductOrder;
