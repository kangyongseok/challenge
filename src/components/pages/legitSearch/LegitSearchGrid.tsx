import { useEffect, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Grid, Skeleton, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';
import { CSSObject } from '@emotion/react';

import { LegitCard, LegitCardSkeleton } from '@components/UI/molecules';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { commaNumber, getProductDetailUrl } from '@utils/common';

import { legitSearchActiveFilterParamsState } from '@recoil/legitSearchFilter';

function LegitSearchGrid() {
  const router = useRouter();

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
    const handleScroll = async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor = scrollTop + clientHeight >= scrollHeight;

      if (hasNextPage && !isFetchingNextPage && isFloor) {
        await fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
      <LegitGridContainer container>
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => {
            let bottomLeftRadius = index === productLegits.length - 2 ? 8 : 0;
            let bottomRightRadius = index === productLegits.length - 1 ? 8 : 0;

            if (productLegits.length % 2 !== 0) {
              bottomLeftRadius = index === productLegits.length - 1 ? 8 : 0;
              bottomRightRadius = 0;
            }

            return (
              <LegitGrid
                // eslint-disable-next-line react/no-array-index-key
                key={`legit-serach-product-legit-skeleton-${index}`}
                item
                xs={2}
                hideBorderTop={index > 1}
                bottomLeftRadius={bottomLeftRadius}
                bottomRightRadius={bottomRightRadius}
              >
                <LegitCardSkeleton />
              </LegitGrid>
            );
          })}
        {!isLoading &&
          productLegits.map((productLegit, index) => {
            let bottomLeftRadius = index === productLegits.length - 2 ? 8 : 0;
            let bottomRightRadius = index === productLegits.length - 1 ? 8 : 0;

            if (productLegits.length % 2 !== 0) {
              bottomLeftRadius = index === productLegits.length - 1 ? 8 : 0;
              bottomRightRadius = 0;
            }

            return (
              <LegitGrid
                key={`legit-serach-product-legit-${productLegit.productId}`}
                item
                xs={2}
                hideBorderTop={index > 1}
                bottomLeftRadius={bottomLeftRadius}
                bottomRightRadius={bottomRightRadius}
                onClick={() =>
                  router.push(
                    `/legit${getProductDetailUrl({
                      type: 'productResult',
                      product: productLegit.productResult
                    }).replace(/\/products/g, '')}/result`
                  )
                }
              >
                <LegitCard productLegit={productLegit} />
              </LegitGrid>
            );
          })}
      </LegitGridContainer>
    </Box>
  );
}

const LegitGridContainer = styled(Grid)`
  border-left: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  border-radius: 8px;
  overflow: hidden;
`;

const LegitGrid = styled(Grid)<{
  hideBorderTop: boolean;
  bottomLeftRadius: number;
  bottomRightRadius: number;
}>`
  ${({ hideBorderTop }): CSSObject =>
    !hideBorderTop
      ? {
          borderTop: '1px solid'
        }
      : {}};
  border-right: 1px solid;
  border-bottom: 1px solid;
  border-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.line02};
  border-bottom-left-radius: ${({ bottomLeftRadius }) => bottomLeftRadius}px;
  border-bottom-right-radius: ${({ bottomRightRadius }) => bottomRightRadius}px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export default LegitSearchGrid;
