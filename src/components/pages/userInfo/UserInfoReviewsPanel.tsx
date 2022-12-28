/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
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

import { fetchReviewsByUserId, postReviewBlock, postReviewReport } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface UserInfoReviewsPanelProps {
  userId: number;
}

function UserInfoReviewsPanel({ userId }: UserInfoReviewsPanelProps) {
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

  const params = useMemo(() => ({ userId, size: 20 }), [userId]);
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
      enabled: !!params.userId,
      refetchOnMount: true,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        if (number > 0) {
          logEvent(attrKeys.userInfo.LOAD_MOREAUTO, {
            title: attrProperty.title.SELLER_REVIEW,
            name: attrProperty.name.SELLER_REVIEW,
            page: number,
            userId
          });
        }

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

  return !isLoading && userReviews.length === 0 ? (
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

export default UserInfoReviewsPanel;
