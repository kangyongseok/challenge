import { useMemo, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { NewProductListCard, NewProductListCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchSearch, fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchParamsStateFamily } from '@recoil/productsFilter';

function ProductsRelated() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));

  const [params] = useState({
    size: 10,
    order: 'datePosted,desc'
  });

  const { data: { pages: newPages = [] } = {}, isFetched } = useInfiniteQuery(
    queryKeys.products.search(searchParams),
    ({ pageParam = 0 }) =>
      fetchSearch({
        ...searchParams,
        page: pageParam
      }),
    {
      select: ({ pages = [], pageParams }) => {
        const lastPage = pages[pages.length - 1];
        if (pages[0].resultUseAI) {
          logEvent(attrKeys.products.LOAD_PRODUCT_LIST_ZAI);
        }
        return {
          pages: [(lastPage || {}).productTotal || 0],
          pageParams
        };
      },
      keepPreviousData: true,
      enabled: Object.keys(searchParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  const hasProducts = useMemo(() => !!newPages.filter((newPage) => newPage).length, [newPages]);

  const {
    data: { page: { content = [] } = {} } = {},
    isLoading,
    isFetched: isSearchRelatedProductsFetched
  } = useQuery(
    queryKeys.products.searchRelatedProducts(params),
    () => fetchSearchRelatedProducts(params),
    {
      keepPreviousData: true,
      enabled: isFetched && !hasProducts
    }
  );

  if (
    (isLoading && !hasProducts) ||
    (isSearchRelatedProductsFetched && !hasProducts && !content.length)
  ) {
    return (
      <Box customStyle={{ padding: '24px 20px 0 20px' }}>
        <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 16 }}>
          이런 매물은 어때요?
        </Typography>
        <Flexbox direction="vertical" gap={20}>
          {Array.from({ length: 10 }, (_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <NewProductListCardSkeleton key={`search-related-product-${index}`} />
          ))}
        </Flexbox>
      </Box>
    );
  }

  if (isFetched && !hasProducts) {
    return (
      <Box customStyle={{ padding: '24px 20px 0 20px' }}>
        <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 16 }}>
          이런 매물은 어때요?
        </Typography>
        <Flexbox direction="vertical" gap={20}>
          {content.map((product) => (
            <NewProductListCard
              key={`search-related-product-${product.id}`}
              product={product}
              attributes={{
                name: attrProperty.productName.PRODUCT_DETAIL
              }}
            />
          ))}
        </Flexbox>
      </Box>
    );
  }

  return null;
}

export default ProductsRelated;
