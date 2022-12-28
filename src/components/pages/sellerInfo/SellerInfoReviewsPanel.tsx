/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Index,
  InfiniteLoader,
  List,
  ListRowProps,
  WindowScroller
} from 'react-virtualized';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ReviewCard } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { fetchReviewInfo, postSellerReport } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { reviewBlockState } from '@recoil/productReview';
import { deviceIdState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface SellerInfoReviewsPanelProps {
  sellerId: number;
}

function SellerInfoReviewsPanel({ sellerId }: SellerInfoReviewsPanelProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);
  const setReviewBlockState = useSetRecoilState(reviewBlockState);
  const setToastState = useSetRecoilState(toastState);

  const { data: accessUser } = useQueryAccessUser();
  const { mutate: muatePostSellerReport, isLoading: isLoadingMutation } =
    useMutation(postSellerReport);

  const params = useMemo(() => ({ sellerId, size: 20 }), [sellerId]);
  const {
    data: { pageParams = [], pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.products.reviewInfo(params),
    async ({ pageParam = 0 }) => fetchReviewInfo({ ...params, page: pageParam }),
    {
      enabled: !!params.sellerId,
      refetchOnMount: true,
      getNextPageParam: (nextData) => {
        const { sellerReviews: { number = 0, totalPages = 0 } = {} } = nextData || {};

        if (number > 0) {
          logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
            title: attrProperty.title.SELLER_REVIEW,
            name: attrProperty.name.SELLER_REVIEW,
            page: number,
            sellerId
          });
        }

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const sellerReviews = useMemo(
    () => pages.flatMap(({ sellerReviews: { content } }) => content),
    [pages]
  );

  const loadMoreRows = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleResize = useCallback(() => {
    cache.clearAll();
  }, []);

  const handleClickBlock = useCallback(
    (productId: number, creator: string) => () => {
      if (isLoadingMutation) return;

      if (!accessUser) {
        router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
        return;
      }

      muatePostSellerReport(
        {
          creator,
          deviceId,
          productId,
          reportType: 0,
          userId: accessUser.userId
        },
        {
          onSuccess() {
            queryClient.setQueryData(queryKeys.products.reviewInfo(params), {
              pageParams,
              pages: pages.map((page) => ({
                ...page,
                sellerReviews: {
                  ...page.sellerReviews,
                  content: page.sellerReviews.content.map((sellerReview) =>
                    sellerReview.productId === productId
                      ? { ...sellerReview, reportStatus: 2 }
                      : sellerReview
                  )
                }
              }))
            });
            setReviewBlockState(true);
            setToastState({ type: 'user', status: 'reviewBlock' });
          }
        }
      );
    },
    [
      accessUser,
      deviceId,
      isLoadingMutation,
      muatePostSellerReport,
      pageParams,
      pages,
      params,
      queryClient,
      router,
      setReviewBlockState,
      setToastState
    ]
  );

  const handleClickReport = useCallback(
    (productId: number) => () => {
      if (isLoadingMutation) return;

      if (!accessUser) {
        router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
        return;
      }

      muatePostSellerReport(
        {
          deviceId,
          productId,
          reportType: 0,
          reviewId: sellerId,
          userId: accessUser.userId
        },
        {
          onSuccess() {
            queryClient.setQueryData(queryKeys.products.reviewInfo(params), {
              pageParams,
              pages: pages.map((page) => ({
                ...page,
                sellerReviews: {
                  ...page.sellerReviews,
                  content: page.sellerReviews.content.map((sellerReview) =>
                    sellerReview.productId === productId
                      ? { ...sellerReview, reportStatus: 1 }
                      : sellerReview
                  )
                }
              }))
            });
            setReviewBlockState(true);
            setToastState({ type: 'user', status: 'reviewReport' });
          }
        }
      );
    },
    [
      accessUser,
      deviceId,
      sellerId,
      isLoadingMutation,
      muatePostSellerReport,
      pageParams,
      pages,
      params,
      queryClient,
      router,
      setReviewBlockState,
      setToastState
    ]
  );

  const rowRenderer = useCallback(
    ({ key, index, parent, style }: ListRowProps) => {
      const review = sellerReviews[index];
      const [firstReviewInfo] = pages;

      return review ? (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          <div style={{ ...style, paddingBottom: 12 }}>
            <ReviewCard
              reportStatus={review.reportStatus as keyof typeof REPORT_STATUS}
              creator={review.creator}
              content={review.content}
              score={Number(review.score || '')}
              curnScore={Number(firstReviewInfo.curnScore || '')}
              maxScore={Number(firstReviewInfo.maxScore || '')}
              siteId={firstReviewInfo.site?.id || 0}
              onClickBlock={handleClickBlock(review.productId, review.creator)}
              onClickReport={handleClickReport(review.productId)}
            />
          </div>
        </CellMeasurer>
      ) : null;
    },
    [handleClickBlock, handleClickReport, pages, sellerReviews]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return !isLoading && sellerReviews.length === 0 ? (
    <Typography
      weight="bold"
      variant="h3"
      customStyle={{ textAlign: 'center', margin: '84px 20px 0', color: common.ui60 }}
    >
      작성된 후기가 없어요
    </Typography>
  ) : (
    <>
      {!isLoading && (
        <Banner>
          <Typography variant="body2" customStyle={{ color: common.ui60 }}>
            판매자의 최근 후기만 보여드려요
          </Typography>
        </Banner>
      )}
      <Flexbox
        component="section"
        direction="vertical"
        gap={isLoading ? 12 : 0}
        customStyle={{ padding: 20 }}
      >
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`profle-review-card-${index}`}
              width="100%"
              height={62}
              round={8}
              disableAspectRatio
            />
          ))
        ) : (
          // @ts-ignore
          <InfiniteLoader
            isRowLoaded={({ index }: Index) => !!sellerReviews[index]}
            loadMoreRows={loadMoreRows}
            rowCount={hasNextPage ? sellerReviews.length + 1 : sellerReviews.length}
          >
            {({ registerChild, onRowsRendered }) => (
              // @ts-ignore
              <WindowScroller>
                {({ height, isScrolling, scrollTop, scrollLeft }) => (
                  // @ts-ignore
                  <AutoSizer disableHeight onResize={handleResize}>
                    {({ width }) => (
                      // @ts-ignore
                      <List
                        ref={registerChild}
                        onRowsRendered={onRowsRendered}
                        width={width}
                        autoHeight
                        height={height}
                        rowCount={sellerReviews.length}
                        rowHeight={cache.rowHeight}
                        rowRenderer={rowRenderer}
                        scrollTop={scrollTop}
                        scrollLeft={scrollLeft}
                        isScrolling={isScrolling}
                        deferredMeasurementCache={cache}
                      />
                    )}
                  </AutoSizer>
                )}
              </WindowScroller>
            )}
          </InfiniteLoader>
        )}
      </Flexbox>
    </>
  );
}

const Banner = styled.section`
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
  padding: 12px 20px;
  text-align: center;
`;

export default SellerInfoReviewsPanel;
