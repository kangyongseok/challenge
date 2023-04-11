import { useEffect, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Grid, Skeleton, Typography } from 'mrcamel-ui';
import { useInfiniteQuery } from '@tanstack/react-query';

import { LegitGridCard, LegitGridCardSkeleton } from '@components/UI/molecules';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { commaNumber, getProductDetailUrl } from '@utils/common';

import { legitSearchActiveFilterParamsState } from '@recoil/legitSearchFilter';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

function LegitSearchGrid() {
  const router = useRouter();

  const { triggered } = useDetectScrollFloorTrigger();

  const activeParams = useRecoilValue(legitSearchActiveFilterParamsState);

  const {
    data: { pages = [] } = {},
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.productLegits.searchLegits(activeParams),
    ({ pageParam = 0 }) =>
      fetchProductLegits({
        ...activeParams,
        page: pageParam
      }),
    {
      staleTime: 5 * 60 * 1000,
      getNextPageParam: (data) => {
        const { productLegits: { number = 0, totalPages = 0 } = {} } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const productLegits = useMemo(
    () =>
      pages
        .flatMap(({ productLegits: pageProductLegits = [] }) => pageProductLegits)
        .flatMap(({ content = [] }) => content),
    [pages]
  );

  const lastProductLegit = useMemo(() => pages[pages.length - 1], [pages]);

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return (
    <Box component="section" customStyle={{ padding: 20 }}>
      {isLoading && (
        <Skeleton
          width={70}
          height={16}
          round={8}
          disableAspectRatio
          customStyle={{
            marginBottom: 13
          }}
        />
      )}
      {!isLoading && (
        <Typography
          variant="body2"
          weight="bold"
          customStyle={{
            marginBottom: 13
          }}
        >
          전체 {commaNumber(((lastProductLegit || {}).productLegits || {}).totalElements)}개
        </Typography>
      )}
      <Grid container columnGap={11.5} rowGap={32}>
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <Grid
              // eslint-disable-next-line react/no-array-index-key
              key={`legit-serach-product-legit-skeleton-${index}`}
              item
              xs={2}
            >
              <LegitGridCardSkeleton variant="gridB" />
            </Grid>
          ))}
        {!isLoading &&
          productLegits.map((productLegit) => (
            <Grid
              key={`legit-serach-product-legit-${productLegit.productId}`}
              item
              xs={2}
              onClick={() =>
                router.push(
                  `/legit${getProductDetailUrl({
                    type: 'productResult',
                    product: productLegit.productResult
                  }).replace(/\/products/g, '')}/result`
                )
              }
            >
              <LegitGridCard
                variant="gridB"
                product={productLegit.productResult}
                result={productLegit.result}
                status={productLegit.status}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}

export default LegitSearchGrid;
