import { useEffect, useMemo } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Chip, Flexbox, Grid, Typography, dark, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitCard, LegitCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { getProductDetailUrl } from '@utils/common';

import { legitFilterGridParamsState, legitFiltersState } from '@recoil/legit';

function LegitFilterGrid() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [legitFilterGridParams, setLegitFilterGridParams] = useRecoilState(
    legitFilterGridParamsState
  );
  const resetLegitFilterGridParamsState = useResetRecoilState(legitFilterGridParamsState);
  const [{ initialized, legitFilters }, setLegitFilters] = useRecoilState(legitFiltersState);

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.productLegits.legits(legitFilterGridParams),
    ({ pageParam = 0 }) => fetchProductLegits({ ...legitFilterGridParams, page: pageParam }),
    {
      staleTime: 5 * 60 * 1000,
      getNextPageParam: (data) => {
        const { productLegits: { number = 0, totalPages = 0 } = {} } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const legitProducts = useMemo(
    () => pages.map(({ productLegits }) => productLegits?.content).flat(),
    [pages]
  );
  const isLastPage = useMemo(() => {
    const lastPage = pages[pages.length - 1] || {};
    return legitProducts.length >= 80 || lastPage?.productLegits?.last;
  }, [pages, legitProducts]);

  const handleClickCard =
    ({ product }: { product: ProductResult }) =>
    () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
        name: attrProperty.legitName.LEGIT_MAIN,
        title: attrProperty.legitTitle.HISTORY
      });

      router.push(
        `/legit${getProductDetailUrl({ type: 'productResult', product }).replace(
          '/products',
          ''
        )}/result`
      );
    };

  const handleClickChip =
    ({ selectResult, selectStatus }: { selectResult: number; selectStatus: number }) =>
    () => {
      const newLegitFilters = legitFilters.map((legitFilter) =>
        legitFilter.result === selectResult && legitFilter.status === selectStatus
          ? { ...legitFilter, isActive: !legitFilter.isActive }
          : legitFilter
      );
      const activeLegitFilters = newLegitFilters.filter(({ isActive }) => isActive);
      let att = '감정진행중';

      if (selectResult === 1) att = '정품의견';

      if (selectResult === 2) att = '가품의심';

      logEvent(attrKeys.legit.CLICK_LEGIT_FILTER, {
        name: attrProperty.legitName.LEGIT_MAIN,
        title: attrProperty.legitTitle.HISTORY,
        att
      });

      setLegitFilters((currVal) => ({ ...currVal, legitFilters: newLegitFilters }));

      if (activeLegitFilters.length === 0) {
        resetLegitFilterGridParamsState();
      } else {
        setLegitFilterGridParams((currLegitFilterGridParams) => ({
          ...currLegitFilterGridParams,
          results: activeLegitFilters.map(({ result }) => result),
          status: Array.from(new Set(activeLegitFilters.map(({ status }) => status)))
        }));
      }
    };

  const handleClickMoreButton = async () => {
    logEvent(attrKeys.legit.CLICK_LOADMORE, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.HISTORY
    });

    if (isLastPage) return;
    await fetchNextPage();
  };

  useEffect(() => {
    const [firstPage] = pages;

    if (firstPage && !initialized) {
      setLegitFilters(({ legitFilters: curLegitFilters }) => ({
        initialized: true,
        legitFilters: curLegitFilters.map((curLegitFilter) => {
          switch (curLegitFilter.result) {
            case 0:
              return { ...curLegitFilter, count: firstPage.cntAuthenticating };
            case 1:
              return { ...curLegitFilter, count: firstPage.cntReal };
            case 2:
              return { ...curLegitFilter, count: firstPage.cntFake };
            default:
              return curLegitFilter;
          }
        })
      }));
    }
  }, [initialized, pages, setLegitFilters]);

  return (
    <Flexbox component="section" direction="vertical" customStyle={{ padding: '0 20px' }}>
      <Flexbox gap={6}>
        {legitFilters.map(
          ({ label, count, isActive, result: selectResult, status: selectStatus }) => (
            <Chip
              key={`legit-select-label-${label}`}
              weight="regular"
              variant={isActive ? 'contained' : 'outlined'}
              brandColor={isActive ? 'black' : 'gray'}
              disabled={isLoading && !initialized}
              onClick={handleClickChip({ selectResult, selectStatus })}
            >
              <Flexbox gap={2} customStyle={{ alignItems: 'baseline' }}>
                <Typography variant="body1" customStyle={{ color: 'inherit' }}>
                  {label}
                </Typography>
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{ color: dark.palette.common.ui60 }}
                >
                  {commaNumber(count)}
                </Typography>
              </Flexbox>
            </Chip>
          )
        )}
      </Flexbox>
      <ProductGrid container>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`legit-skeleton-${index}`} item xs={2}>
                <LegitCardSkeleton />
              </Grid>
            ))
          : legitProducts.map((productLegit) => (
              <Grid key={`legit-${productLegit.productId}`} item xs={2}>
                <LegitCard
                  productLegit={productLegit}
                  onClick={handleClickCard({ product: productLegit.productResult })}
                />
              </Grid>
            ))}
      </ProductGrid>
      {!isLastPage && (
        <Button
          fullWidth
          onClick={handleClickMoreButton}
          customStyle={{ borderTop: 'none', borderColor: common.ui95, borderRadius: '0 0 8px 8px' }}
        >
          <Typography variant="body2" weight="medium">
            더보기
          </Typography>
        </Button>
      )}
    </Flexbox>
  );
}

const ProductGrid = styled(Grid)`
  margin-top: 17px;
  overflow: hidden;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  border-right: none;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  & > div {
    border-top: 1px solid;
    border-right: 1px solid;
    border-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  }
`;

export default LegitFilterGrid;
