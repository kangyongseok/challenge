import { useQuery } from '@tanstack/react-query';

import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import useSession from './useSession';

interface UseQueryProductOrderProps {
  productId: number;
  includeLegit?: string | boolean;
  type?: number;
}

function useQueryProductOrder({ productId, includeLegit, type = 0 }: UseQueryProductOrderProps) {
  const { isLoggedInWithSMS } = useSession();

  return useQuery(
    queryKeys.orders.productOrder({
      productId,
      isCreated: true,
      includeLegit: includeLegit === 'undefined' ? undefined : includeLegit,
      type
    }),
    () =>
      fetchProductOrder({
        productId,
        isCreated: true,
        includeLegit: includeLegit === 'undefined' ? undefined : includeLegit,
        type
      }),
    {
      enabled: isLoggedInWithSMS && !!productId && !Number.isNaN(type),
      refetchOnMount: true
    }
  );
}

export default useQueryProductOrder;
