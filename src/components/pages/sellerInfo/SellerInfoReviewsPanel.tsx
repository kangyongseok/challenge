import { useCallback, useEffect, useMemo } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Image, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { ReviewCard } from '@components/UI/organisms';
import { Empty } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchReviewInfo, postSellerReport } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import { reviewBlockState } from '@recoil/productReview';
import { deviceIdState } from '@recoil/common';
import useSession from '@hooks/useSession';
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

  const { isLoggedIn, data: accessUser } = useSession();

  const { mutate: muatePostSellerReport, isLoading: isLoadingMutation } =
    useMutation(postSellerReport);

  const params = useMemo(() => ({ sellerId, size: 20 }), [sellerId]);
  const {
    data: { pageParams = [], pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchStatus
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

      if (!isLoggedIn) {
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
          userId: accessUser?.userId
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
      isLoggedIn,
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

      if (!isLoggedIn) {
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
          userId: accessUser?.userId
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
      isLoadingMutation,
      isLoggedIn,
      muatePostSellerReport,
      deviceId,
      sellerId,
      accessUser?.userId,
      router,
      queryClient,
      params,
      pageParams,
      pages,
      setReviewBlockState,
      toastStack
    ]
  );

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  if (fetchStatus === 'idle' && sellerReviews.length === 0) {
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
