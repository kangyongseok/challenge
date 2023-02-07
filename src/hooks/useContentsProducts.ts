import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';

function useContentsProducts(contentsId: number) {
  const { data: { contents } = {}, ...useQueryResult } = useQuery(
    queryKeys.commons.contentsProducts(contentsId),
    () => fetchContentsProducts(contentsId),
    {
      enabled: !!contentsId,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  );

  const wishTotalCount = useMemo(
    () =>
      contents?.contentsDetails?.flatMap((contentsDetail) =>
        contentsDetail.products.filter(({ isWish }) => !!isWish)
      )?.length || 0,
    [contents]
  );

  return { ...useQueryResult, data: { contents, wishTotalCount } };
}

export default useContentsProducts;
