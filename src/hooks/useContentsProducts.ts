import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';

function useContentsProducts(contentsId: number) {
  const {
    data: {
      contents = {
        dateUpdated: '',
        dateCreated: '',
        id: 0,
        status: 0,
        title: '',
        url: '',
        dateStart: '',
        dateEnd: '',
        description: '',
        imageMain: '',
        imageMainBanner: '',
        imageListBanner: '',
        imageThumbnail: ''
      },
      products = []
    } = {},
    ...useQueryResult
  } = useQuery(
    queryKeys.common.contentsProducts(contentsId),
    () => fetchContentsProducts(contentsId),
    {
      enabled: !!contentsId,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  );

  const wishTotalCount = useMemo(
    () => products.flatMap((product) => product).filter(({ isWish }) => !!isWish).length,
    [products]
  );

  return { ...useQueryResult, data: { products, contents, wishTotalCount } };
}

export default useContentsProducts;
