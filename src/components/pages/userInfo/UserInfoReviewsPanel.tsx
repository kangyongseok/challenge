import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Image, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { ReviewCard } from '@components/UI/organisms';
import { Empty } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchReviewsByUserId, postReviewBlock, postReviewReport } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import useSession from '@hooks/useSession';
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
  const { isLoggedIn, data: accessUser } = useSession();

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
    isFetching,
    fetchStatus
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

      if (!isLoggedIn) {
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
      isLoggedIn,
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

      if (!isLoggedIn) {
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
      isLoggedIn,
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

  if (
    (fetchStatus === 'idle' && userReviews.length === 0) ||
    (pages && typeof pages[0] === 'string' && pages.length === 0)
  ) {
    return (
      <Empty>
        <Image
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/empty_paper.png`,
            w: 52
          })}
          alt="empty img"
          width={52}
          height={52}
          disableAspectRatio
          disableSkeleton
        />
        <Flexbox direction="vertical" alignment="center" justifyContent="center" gap={8}>
          <Typography variant="h3" weight="bold" color="ui60">
            등록된 후기가 없어요
          </Typography>
        </Flexbox>
      </Empty>
    );
  }

  return (
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
