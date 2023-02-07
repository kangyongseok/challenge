/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller
} from 'react-virtualized';
import type { Index, ListRowProps } from 'react-virtualized';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';

import ReviewCard from '@components/UI/organisms/ReviewCard';
import UserShopEmpty from '@components/pages/userShop/UserShopEmpty';

import { fetchReviewsByUserId, postReviewBlock, postReviewReport } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';

import { toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface UserShopReviewListProps {
  userId: number;
  reviewCount: number;
  curnScore: number;
  maxScore: number;
}

function UserShopReviewList({ userId, reviewCount, curnScore, maxScore }: UserShopReviewListProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setToastState = useSetRecoilState(toastState);
  const { data: accessUser } = useQueryAccessUser();
  const { mutate: mutatePostReviewBlock, isLoading: isLoadingPostReviewBlock } =
    useMutation(postReviewBlock);
  const { mutate: mutatePostReviewReport, isLoading: isLoadingPostReviewReport } =
    useMutation(postReviewReport);

  const params = useMemo(() => ({ userId, size: 30 }), [userId]);
  const {
    data: { pageParams = [], pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.users.reviewsByUserId(params),
    async ({ pageParam = 0 }) => fetchReviewsByUserId({ ...params, page: pageParam }),
    {
      enabled: !!params.userId && reviewCount > 0,
      refetchOnMount: true,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const userReviews = useMemo(() => pages.flatMap(({ content }) => content), [pages]);

  const loadMoreRows = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleResize = useCallback(() => {
    cache.clearAll();
  }, []);

  const handleClickBlock = useCallback(
    (reviewId: number) => () => {
      if (isLoadingPostReviewBlock) return;

      if (!accessUser) {
        router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      }

      mutatePostReviewBlock(reviewId, {
        onSuccess() {
          queryClient.setQueryData(queryKeys.users.reviewsByUserId(params), {
            pageParams,
            pages: pages.map((page) => ({
              ...page,
              content: page.content.map((userReview) =>
                userReview.id === reviewId ? { ...userReview, reportStatus: 2 } : userReview
              )
            }))
          });
          setToastState({ type: 'user', status: 'reviewBlock' });
        }
      });
    },
    [
      accessUser,
      isLoadingPostReviewBlock,
      mutatePostReviewBlock,
      pageParams,
      pages,
      params,
      queryClient,
      router,
      setToastState
    ]
  );

  const handleClickReport = useCallback(
    (reviewId: number) => () => {
      if (isLoadingPostReviewReport) return;

      if (!accessUser) {
        router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      }

      mutatePostReviewReport(reviewId, {
        onSuccess() {
          queryClient.setQueryData(queryKeys.users.reviewsByUserId(params), {
            pageParams,
            pages: pages.map((page) => ({
              ...page,
              content: page.content.map((userReview) =>
                userReview.id === reviewId ? { ...userReview, reportStatus: 1 } : userReview
              )
            }))
          });
          setToastState({ type: 'user', status: 'reviewReport' });
        }
      });
    },
    [
      accessUser,
      isLoadingPostReviewReport,
      mutatePostReviewReport,
      pageParams,
      pages,
      params,
      queryClient,
      router,
      setToastState
    ]
  );

  const rowRenderer = useCallback(
    ({ key, index, parent, style }: ListRowProps) => {
      const review = userReviews[index];

      return review ? (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          <div style={{ ...style, paddingBottom: 12 }}>
            <ReviewCard
              reportStatus={review.reportType as keyof typeof REPORT_STATUS}
              creator={review.creator}
              isMyReview={review.createUserId === accessUser?.userId}
              isSeller={review.creatorType === 1}
              isBuyer={review.creatorType === 2}
              content={review.content}
              score={Number(review.score || '')}
              maxScore={Number(review.score || '') > 5 ? 10 : 5}
              onClickBlock={handleClickBlock(review.id)}
              onClickReport={handleClickReport(review.id)}
            />
          </div>
        </CellMeasurer>
      ) : null;
    },
    [accessUser?.userId, handleClickBlock, handleClickReport, userReviews]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return reviewCount === 0 ? (
    <UserShopEmpty tab="2" />
  ) : (
    <Flexbox
      component="section"
      direction="vertical"
      gap={32}
      customStyle={{ padding: '32px 20px 85px' }}
    >
      {isLoading ? (
        <>
          <Flexbox direction="vertical" alignment="center" gap={4}>
            <Score>
              <Skeleton width={40} height={24} disableAspectRatio round={8} />
              <Skeleton width={46} height={16} disableAspectRatio round={8} />
            </Score>
            <Skeleton width={84} height={16} disableAspectRatio round={8} />
          </Flexbox>
          <Flexbox direction="vertical" gap={12}>
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`profile-review-card-${index}`}
                width="100%"
                height={62}
                round={8}
                disableAspectRatio
              />
            ))}
          </Flexbox>
        </>
      ) : (
        <>
          <Flexbox direction="vertical" alignment="center" gap={4}>
            <Score>
              <Typography variant="h3" weight="bold">
                {`${maxScore === 10 ? Math.floor(curnScore / 2) : curnScore}점`}
              </Typography>
              <Typography variant="body2" customStyle={{ color: common.ui60 }}>
                (총 {reviewCount}건)
              </Typography>
            </Score>
            {!!curnScore && !!maxScore && (
              <Flexbox alignment="center" justifyContent="center" gap={1}>
                {Array.from({ length: 5 }, (_, index) => {
                  return index <
                    (maxScore === 10 ? Math.floor(Number(curnScore) / 2) : Number(curnScore)) ? (
                    <Icon
                      name="StarFilled"
                      width={22}
                      height={22}
                      customStyle={{
                        color: '#FFD911'
                      }}
                    />
                  ) : (
                    <Icon
                      name="StarOutlined"
                      width={22}
                      height={22}
                      customStyle={{
                        color: '#FFD911'
                      }}
                    />
                  );
                })}
              </Flexbox>
            )}
          </Flexbox>
          <Flexbox direction="vertical" gap={12}>
            {/* @ts-ignore */}
            <InfiniteLoader
              isRowLoaded={({ index }: Index) => !!userReviews[index]}
              loadMoreRows={loadMoreRows}
              rowCount={hasNextPage ? userReviews.length + 1 : userReviews.length}
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
                          rowCount={userReviews.length}
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
          </Flexbox>
        </>
      )}
    </Flexbox>
  );
}

const Score = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

export default UserShopReviewList;
