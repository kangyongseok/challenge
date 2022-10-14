import { forwardRef, useCallback, useMemo, useState } from 'react';

import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Flexbox, Grid, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitCard, LegitCardSkeleton } from '@components/UI/molecules';

import type { OpinionLegitsParams } from '@dto/productLegit';
import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchOpinionLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';

interface LegitProfileOpinionLegitListProps {
  userId: number;
  customStyle?: CustomStyle;
}

const LegitProfileOpinionLegitList = forwardRef<HTMLElement, LegitProfileOpinionLegitListProps>(
  function LegitProfileOpinionLegitList({ userId, customStyle }, ref) {
    const router = useRouter();
    const {
      theme: {
        palette: { common }
      }
    } = useTheme();

    const [opinionLegitsParams] = useState<OpinionLegitsParams>({
      page: 0,
      size: 16,
      userIds: [userId]
    });
    const {
      data: { pages = [] } = {},
      fetchNextPage,
      isLoading
    } = useInfiniteQuery(
      queryKeys.productLegits.opinionLegits(opinionLegitsParams),
      ({ pageParam = 0 }) =>
        fetchOpinionLegits({
          ...opinionLegitsParams,
          page: pageParam
        }),
      {
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
    const isLastPage = useMemo(
      () => legitProducts.length >= 80 || (pages[pages.length - 1] || {}).last,
      [pages, legitProducts]
    );

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

    const handleClickMoreButton = useCallback(async () => {
      if (isLastPage) return;

      await fetchNextPage();
    }, [fetchNextPage, isLastPage]);

    return (
      <Wrapper
        ref={ref}
        css={!isLoading && legitProducts.length === 0 ? { ...customStyle, flex: 1 } : customStyle}
      >
        {isLoading && (
          <ProductGrid container showBottomBorder>
            {Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`legit-history-skeleton-${index}`} item xs={2}>
                <LegitCardSkeleton />
              </Grid>
            ))}
          </ProductGrid>
        )}
        {!isLoading && legitProducts.length > 0 && (
          <>
            <ProductGrid container showBottomBorder={isLastPage}>
              {legitProducts.map((productLegit, index) => (
                <Grid
                  key={`legit-history-${productLegit.productId}`}
                  item
                  xs={2}
                  customStyle={index === 0 ? {} : {}}
                >
                  <LegitCard
                    productLegit={productLegit}
                    onClick={handleClickProduct({ product: productLegit.productResult })}
                  />
                </Grid>
              ))}
            </ProductGrid>
            {!isLastPage && (
              <Grid
                item
                xs={1}
                customStyle={{
                  borderRadius: '0 0 16px 16px',
                  border: `1px solid ${common.ui95}`
                }}
              >
                <MoreButton fullWidth onClick={handleClickMoreButton}>
                  더보기
                </MoreButton>
              </Grid>
            )}
          </>
        )}
        {!isLoading && legitProducts.length === 0 && (
          <Flexbox justifyContent="center" alignment="center" customStyle={{ marginTop: 84 }}>
            <Typography variant="h2" weight="bold" customStyle={{ color: common.ui80 }}>
              감정이력이 없습니다.
            </Typography>
          </Flexbox>
        )}
      </Wrapper>
    );
  }
);
const Wrapper = styled.section`
  padding: 32px 20px 52px;
  background-color: ${({ theme }) => theme.palette.common.cmnW};
  border-radius: 16px 16px 0 0;
  margin-top: -44px;
  z-index: 2;
`;

const ProductGrid = styled(Grid)<{ showBottomBorder: boolean }>`
  overflow: hidden;
  background-color: ${({ theme: { palette } }) => palette.common.cmnW};
  border-left: 1px solid ${({ theme: { palette } }) => palette.common.ui95};
  border-radius: 8px 8px 0 0;

  & > div {
    border-right: 1px solid ${({ theme: { palette } }) => palette.common.ui95};
    border-bottom: 1px solid ${({ theme: { palette } }) => palette.common.ui95};
  }
`;

const MoreButton = styled(Button)`
  background-color: transparent;
  border-color: transparent;
  border-radius: 0;
  padding: 12px;
  min-height: 40px;

  ${({ theme: { typography } }) => ({
    fontSize: typography.body2.size,
    fontWeight: typography.body2.weight.medium,
    lineHeight: typography.body2.lineHeight,
    letterSpacing: typography.body2.letterSpacing
  })};
`;

export default LegitProfileOpinionLegitList;
