import { forwardRef, useCallback, useEffect, useMemo } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Chip, Flexbox, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import LegitListCard from '@components/UI/molecules/LegitListCard';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchOpinionLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';

import {
  defaultLegitProfileOpinionLegitsParamsState,
  legitProfileOpinionLegitsParamsState
} from '@recoil/legitProfile';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

interface LegitProfileOpinionLegitListProps {
  userId: number;
  customStyle?: CustomStyle;
}

const legitFilters = [
  { result: 1, status: 30, label: '정품의견' },
  { result: 2, status: 30, label: '가품의심' }
];

const LegitProfileOpinionLegitList = forwardRef<HTMLDivElement, LegitProfileOpinionLegitListProps>(
  function LegitProfileOpinionLegitList({ userId, customStyle }, ref) {
    const router = useRouter();
    const {
      theme: {
        palette: { common }
      }
    } = useTheme();

    const { triggered } = useDetectScrollFloorTrigger();

    const [params, setLegitProfileOpinionLegitsParamsState] = useRecoilState(
      legitProfileOpinionLegitsParamsState
    );

    const activeParams = useMemo(() => {
      if (!params.results || !params.results.length)
        return { ...defaultLegitProfileOpinionLegitsParamsState, userIds: params.userIds };
      return { ...params, status: Array.from(new Set(params.status || [])) };
    }, [params]);

    const {
      data: { pages = [] } = {},
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading
    } = useInfiniteQuery(
      queryKeys.productLegits.opinionLegits(activeParams),
      ({ pageParam = 0 }) =>
        fetchOpinionLegits({
          ...activeParams,
          page: pageParam
        }),
      {
        enabled: activeParams.userIds.length > 0,
        staleTime: 5 * 60 * 1000,
        getNextPageParam: (data) => {
          const { number = 0, totalPages = 0 } = data || {};

          return number < totalPages - 1 ? number + 1 : undefined;
        },
        onSuccess() {
          logEvent(attrKeys.legit.LOAD_LEGIT_INFO, {
            name: attrProperty.legitName.LEGIT_PROFILE
          });
        }
      }
    );

    const legitProducts = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);

    const handleClick =
      ({ status, result, label }: { status: number; result: number; label: string }) =>
      () => {
        logEvent(attrKeys.legitProfile.CLICK_LEGIT_FILTER, {
          name: attrProperty.name.LEGIT_PROFILE,
          title: attrProperty.title.LEGIT_STATUS,
          att: label
        });

        setLegitProfileOpinionLegitsParamsState((prevState) => {
          const prevStatus = [...(prevState.status || [])];
          const prevResults = [...(prevState.results || [])];

          const hasAlreadyResult = prevResults.some((number) => number === result);

          if (hasAlreadyResult) prevStatus.splice(prevStatus.lastIndexOf(status), 1);

          return {
            ...prevState,
            status: hasAlreadyResult ? prevStatus : [...prevStatus, status],
            results: hasAlreadyResult
              ? prevResults.filter((number) => number !== result)
              : [...prevResults, result]
          };
        });
      };

    const handleClickProduct = useCallback(
      ({ product }: { product: ProductResult }) =>
        () => {
          logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
            name: attrProperty.legitName.LEGIT_PROFILE
          });

          router.push(
            `/legit${getProductDetailUrl({ type: 'productResult', product }).replace(
              '/products',
              ''
            )}/result`
          );
        },
      [router]
    );

    useEffect(() => {
      setLegitProfileOpinionLegitsParamsState((prevState) => ({
        ...prevState,
        userIds: [userId]
      }));
    }, [setLegitProfileOpinionLegitsParamsState, userId]);

    useEffect(() => {
      if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
    }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

    return (
      <Box component="section">
        <Wrapper
          ref={ref}
          css={!isLoading && legitProducts.length === 0 ? { ...customStyle, flex: 1 } : customStyle}
        >
          {!isLoading && legitProducts.length > 0 && (
            <Flexbox gap={8} customStyle={{ marginBottom: 20 }}>
              {legitFilters.map(({ label, result, status }) => (
                <Chip
                  key={`legit-select-label-${label}`}
                  variant="ghost"
                  brandColor={(params.results || []).includes(result) ? 'blue' : 'black'}
                  size="large"
                  disabled={isLoading}
                  onClick={handleClick({ status, result, label })}
                  isRound={false}
                >
                  {label}
                </Chip>
              ))}
            </Flexbox>
          )}
          <Flexbox direction="vertical" gap={20}>
            {isLoading &&
              Array.from({ length: 16 }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Flexbox key={`user-legit-opinion-skeleton-${index}`} gap={16}>
                  <Skeleton width={100} height={120} round={8} disableAspectRatio />
                  <Flexbox
                    direction="vertical"
                    gap={2}
                    customStyle={{ flexGrow: 1, padding: '2px 0' }}
                  >
                    <Skeleton width={58} height={18} round={8} disableAspectRatio />
                    <Skeleton
                      width="100%"
                      maxWidth={220}
                      height={16}
                      round={8}
                      disableAspectRatio
                    />
                    <Skeleton
                      width="100%"
                      maxWidth={220}
                      height={36}
                      round={8}
                      disableAspectRatio
                      customStyle={{ marginTop: 6 }}
                    />
                  </Flexbox>
                </Flexbox>
              ))}
            {!isLoading &&
              legitProducts.map((productLegit) => (
                <LegitListCard
                  key={`user-legit-opinion-${productLegit.productId}`}
                  variant="listA"
                  productLegit={productLegit}
                  hidePrice
                  hideResult
                  hideMore
                  userId={userId}
                  onClick={handleClickProduct({ product: productLegit.productResult })}
                  customStyle={{
                    alignItems: 'flex-start'
                  }}
                  customTitleStyle={{
                    color: common.ui20
                  }}
                />
              ))}
          </Flexbox>
        </Wrapper>
        {!isLoading && legitProducts.length === 0 && (
          <Flexbox
            direction="vertical"
            justifyContent="center"
            alignment="center"
            gap={20}
            customStyle={{ marginTop: 72 }}
          >
            <Typography customStyle={{ width: 52, height: 52, fontSize: 52 }}>🕵️‍♂️</Typography>
            <Typography variant="h2" weight="bold" customStyle={{ color: common.ui80 }}>
              감정이력이 없습니다.
            </Typography>
          </Flexbox>
        )}
      </Box>
    );
  }
);

const Wrapper = styled.div`
  padding: 32px 20px 35px;
  background-color: ${({ theme }) => theme.palette.common.cmnW};
  z-index: 2;
`;

export default LegitProfileOpinionLegitList;
