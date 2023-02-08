import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Chip, Flexbox, Grid, Icon, Skeleton } from 'mrcamel-ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { LegitGridCard } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';

import { legitSearchFilterParamsState } from '@recoil/legitSearchFilter';
import { legitFilterGridParamsState } from '@recoil/legit';

function LegitFilterGrid() {
  const router = useRouter();

  const [legitFilterGridParams, setLegitFilterGridParams] = useRecoilState(
    legitFilterGridParamsState
  );
  const resetLegitFilterGridParamsState = useResetRecoilState(legitFilterGridParamsState);
  const resetLegitSearchFilterParamsState = useResetRecoilState(legitSearchFilterParamsState);

  const queryClient = useQueryClient();

  const { data: { productLegits: { content: legitProducts = [] } = {} } = {}, isLoading } =
    useQuery(
      queryKeys.productLegits.legits(legitFilterGridParams),
      () => fetchProductLegits(legitFilterGridParams),
      {
        refetchOnMount: true,
        onSuccess(successData) {
          if (successData) {
            setLegitFilters((prevState) =>
              prevState.map((curLegitFilter) => {
                switch (curLegitFilter.result) {
                  case 0:
                    return { ...curLegitFilter, count: successData.cntAuthenticating || 0 };
                  case 1:
                    return { ...curLegitFilter, count: successData.cntReal || 0 };
                  case 2:
                    return { ...curLegitFilter, count: successData.cntFake || 0 };
                  default:
                    return curLegitFilter;
                }
              })
            );
          }
        }
      }
    );

  const [legitFilters, setLegitFilters] = useState(() => [
    { result: 1, status: 30, label: '정품의견', count: 0, isActive: false },
    { result: 2, status: 30, label: '가품의심', count: 0, isActive: false },
    { result: 0, status: 20, label: '감정중', count: 0, isActive: false }
  ]);

  const isInitLegitFiltersRef = useRef(false);

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_HISTORY, {
      name: attrProperty.name.LEGIT_MAIN
    });
    resetLegitSearchFilterParamsState();
    queryClient
      .getQueryCache()
      .getAll()
      .forEach(({ queryKey }) => {
        if (queryKey.includes('searchLegits') && queryKey.length >= 3) {
          queryClient.resetQueries(queryKey);
        }
      });
    router.push('/legit/search');
  };

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
      setLegitFilters(newLegitFilters);
      const activeLegitFilters = newLegitFilters.filter(({ isActive }) => isActive);
      let att = '감정중';

      if (selectResult === 1) att = '정품의견';

      if (selectResult === 2) att = '가품의심';

      logEvent(attrKeys.legit.CLICK_LEGIT_FILTER, {
        name: attrProperty.legitName.LEGIT_MAIN,
        title: attrProperty.legitTitle.HISTORY,
        att
      });

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

  useEffect(() => {
    if ((legitFilterGridParams.results || []).length !== 3 && !isInitLegitFiltersRef.current) {
      isInitLegitFiltersRef.current = true;
      setLegitFilters((prevState) =>
        prevState.map((prevLegitFilter) => ({
          ...prevLegitFilter,
          isActive: (legitFilterGridParams.results || []).includes(prevLegitFilter.result)
        }))
      );
    }
  }, [setLegitFilters, legitFilterGridParams?.results]);

  return (
    <Flexbox component="section" direction="vertical" gap={20}>
      <Flexbox
        gap={8}
        alignment="center"
        justifyContent="space-between"
        customStyle={{ padding: '0 20px' }}
      >
        <Flexbox gap={6}>
          {legitFilters.map(({ label, isActive, result: selectResult, status: selectStatus }) => (
            <Chip
              key={`legit-select-label-${label}`}
              variant="ghost"
              brandColor={isActive ? 'blue' : 'black'}
              size="large"
              disabled={isLoading}
              isRound={false}
              onClick={handleClickChip({ selectResult, selectStatus })}
            >
              {label}
            </Chip>
          ))}
        </Flexbox>
        <Button
          variant="inline"
          brandColor="black"
          size="small"
          endIcon={<Icon name="CaretRightOutlined" />}
          onClick={handleClick}
          customStyle={{ padding: 0, gap: 0 }}
        >
          전체보기
        </Button>
      </Flexbox>
      <Grid
        container
        columnGap={12}
        rowGap={20}
        customStyle={{ padding: '0 20px', marginBottom: 0 }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`legit-skeleton-${index}`} item xs={2}>
                <Flexbox direction="vertical" gap={12} customStyle={{ paddingBottom: 12 }}>
                  <Skeleton
                    round={8}
                    disableAspectRatio
                    customStyle={{ paddingTop: 'calc(100% / 5 * 6)' }}
                  />
                  <Flexbox direction="vertical" gap={2} customStyle={{ padding: '0 4px' }}>
                    <Skeleton width={60} height={16} round={8} disableAspectRatio />
                    <Skeleton width="100%" height={32} round={8} disableAspectRatio />
                  </Flexbox>
                </Flexbox>
              </Grid>
            ))
          : legitProducts.map(({ productId, productResult, result, status }) => (
              <Grid key={`legit-${productId}`} item xs={2}>
                <LegitGridCard
                  variant="gridB"
                  product={productResult}
                  result={result}
                  onClick={handleClickCard({ product: productResult })}
                  status={status}
                />
              </Grid>
            ))}
      </Grid>
      <Button
        fullWidth
        onClick={handleClick}
        size="large"
        customStyle={{
          margin: '0 auto',
          width: 'calc(100% - 40px)'
        }}
      >
        전체보기
      </Button>
    </Flexbox>
  );
}

export default LegitFilterGrid;
