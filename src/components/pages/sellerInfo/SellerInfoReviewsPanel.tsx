import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { ReviewCard } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { fetchReviewInfo, postSellerReport } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { reviewBlockState } from '@recoil/productReview';
import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

interface SellerInfoReviewsPanelProps {
  sellerId: number;
}

function SellerInfoReviewsPanel({ sellerId }: SellerInfoReviewsPanelProps) {
  const router = useRouter();

  const toastStack = useToastStack();
  const { triggered } = useDetectScrollFloorTrigger();

  const deviceId = useRecoilValue(deviceIdState);
  const setReviewBlockState = useSetRecoilState(reviewBlockState);

  const queryClient = useQueryClient();

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

  const handleClickBlock = useCallback(
    (productId: number, reviewId: number) => () => {
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
          reviewId,
          sellerId,
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
                    sellerReview.id === reviewId
                      ? { ...sellerReview, reportStatus: 2 }
                      : sellerReview
                  )
                }
              }))
            });
            setReviewBlockState(true);
            toastStack({
              children: (
                <>
                  차단 처리되었습니다.
                  <br />이 사용자는 가려드릴게요!
                </>
              )
            });
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
      sellerId,
      setReviewBlockState,
      toastStack
    ]
  );

  const handleClickReport = useCallback(
    (productId: number, creator: string, reviewId: number) => () => {
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
          creator,
          sellerId,
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
                    sellerReview.id === reviewId
                      ? { ...sellerReview, reportStatus: 1 }
                      : sellerReview
                  )
                }
              }))
            });
            setReviewBlockState(true);
            toastStack({
              children: (
                <>
                  신고가 접수되었습니다.
                  <br />이 리뷰는 가려드릴게요!
                </>
              )
            });
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
      toastStack
    ]
  );

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return !isLoading && sellerReviews.length === 0 ? (
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
        : sellerReviews.map((review) => (
            <ReviewCard
              key={`profle-review-card-${review.id}`}
              reportStatus={review.reportStatus as keyof typeof REPORT_STATUS}
              creator={review.creator}
              content={review.content}
              score={Number(review.score || '')}
              curnScore={Number(pages[0]?.curnScore || '')}
              maxScore={Number(pages[0]?.maxScore || '')}
              siteId={pages[0]?.site?.id || 0}
              onClickBlock={handleClickBlock(review.productId, review.id)}
              onClickReport={handleClickReport(review.productId, review.creator, review.id)}
            />
          ))}
    </Flexbox>
  );
}

export default SellerInfoReviewsPanel;
