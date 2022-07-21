import { useMemo, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import ProductListCard from '@components/UI/molecules/ProductListCard';
import { ProductListCardSkeleton } from '@components/UI/molecules';

import { fetchSearch, fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

import { searchParamsStateFamily } from '@recoil/productsFilter';

function ProductsRelated() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

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
      <>
        <Box customStyle={{ width: '100%', height: 8, backgroundColor: common.grey['90'] }} />
        <Box customStyle={{ padding: '24px 20px 0 20px' }}>
          <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 16 }}>
            이런 매물은 어때요?
          </Typography>
          <Flexbox direction="vertical" gap={20}>
            {Array.from({ length: 10 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProductListCardSkeleton key={`search-related-product-${index}`} />
            ))}
          </Flexbox>
        </Box>
      </>
    );
  }

  if (isFetched && !hasProducts) {
    return (
      <>
        <Box customStyle={{ width: '100%', height: 8, backgroundColor: common.grey['90'] }} />
        <Box customStyle={{ padding: '24px 20px 0 20px' }}>
          <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 16 }}>
            이런 매물은 어때요?
          </Typography>
          <Flexbox direction="vertical" gap={20}>
            {content.map((product) => (
              <ProductListCard
                key={`search-related-product-${product.id}`}
                product={product}
                name={attrProperty.productName.PRODUCT_DETAIL}
              />
            ))}
          </Flexbox>
        </Box>
      </>
    );
  }

  return null;
}

export default ProductsRelated;
