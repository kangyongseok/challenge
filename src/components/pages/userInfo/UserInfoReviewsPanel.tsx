import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { ReviewCard } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { fetchReviewsByUserId, postReviewBlock, postReviewReport } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

interface UserInfoReviewsPanelProps {
  userId: number;
}

function UserInfoReviewsPanel({ userId }: UserInfoReviewsPanelProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { scrollToReviewUserId } = router.query;

  const toastStack = useToastStack();
  const { triggered } = useDetectScrollFloorTrigger();

  const { data: accessUser } = useQueryAccessUser();
  const { mutate: mutatePostReviewBlock, isLoading: isLoadingPostReviewBlock } =
    useMutation(postReviewBlock);
  const { mutate: mutatePostReviewReport, isLoading: isLoadingPostReviewReport } =
    useMutation(postReviewReport);

  const params = useMemo(() => ({ userId, size: 20 }), [userId]);

  const scrollDoneRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    data: { pageParams = [], pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching
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
          toastStack({
            children: (
              <>
                차단 처리되었습니다.
                <br />이 사용자는 가려드릴게요!
              </>
            )
          });
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
      toastStack
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
          toastStack({
            children: (
              <>
                신고가 접수되었습니다.
                <br />이 리뷰는 가려드릴게요!
              </>
            )
          });
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
      toastStack
    ]
  );

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!isLoading && !scrollDoneRef.current) {
      const lastReviewEl = document.getElementsByClassName(`review-${scrollToReviewUserId}`)[0];

      if (lastReviewEl) {
        scrollDoneRef.current = true;
        scrollTimerRef.current = setTimeout(() => {
          window.scrollTo({
            top: lastReviewEl.getBoundingClientRect().top - 200,
            behavior: 'smooth'
          });
        }, 700);
      }
    }
  }, [scrollToReviewUserId, isLoading, isFetching, pages]);

  useEffect(() => {
    return () => {
      clearTimeout(scrollTimerRef.current);
    };
  }, []);

  return !isLoading &&
    (userReviews.length === 0 || (pages && typeof pages[0] === 'string' && pages.length === 0)) ? (
    <Flexbox
      direction="vertical"
      alignment="center"
      gap={20}
      customStyle={{
        margin: '84px 20px 0'
      }}
    >
      <Typography customStyle={{ width: 52, height: 52, fontSize: 52 }}>🥲</Typography>
      <Typography variant="h3" weight="bold">
        작성된 후기가 없어요
      </Typography>
    </Flexbox>
  ) : (
    <Flexbox component="section" direction="vertical" gap={12} customStyle={{ padding: 20 }}>
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`profle-review-card-skeleton-${index}`}
              width="100%"
              height={62}
              round={8}
              disableAspectRatio
            />
          ))
        : userReviews.map((review) => (
            <ReviewCard
              key={`profle-review-card-${review.id}`}
              reportStatus={review.reportType as keyof typeof REPORT_STATUS}
              creator={review.creator}
              isMyReview={review.createUserId === accessUser?.userId}
              content={review.content}
              score={Number(review.score || '')}
              maxScore={Number(review.score || '') > 5 ? 10 : 5}
              reviewCreatedUserId={review.createUserId}
              onClickBlock={handleClickBlock(review.id)}
              onClickReport={handleClickReport(review.id)}
            />
          ))}
    </Flexbox>
  );
}

export default UserInfoReviewsPanel;
