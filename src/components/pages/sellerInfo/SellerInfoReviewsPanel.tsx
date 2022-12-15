import { useEffect, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

import { logEvent } from '@library/amplitude';

import { fetchReviewInfo } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import atom from '@recoil/productReview';

import SellerInfoReviewCard from './SellerInfoReviewCard';

function SellerInfoReviewsPanel() {
  const {
    query: { id }
  } = useRouter();
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  const [toastState, setToastState] = useState<{ type: null | 'report' | 'block'; open: boolean }>({
    type: null,
    open: false
  });
  const setReviewBlockState = useSetRecoilState(atom.reviewBlockState);
  const reviewInfoParams = {
    sellerId: Number(id || 0),
    size: 20
  };
  const productsPage = useRef(0);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    queryKeys.products.reviewInfo(reviewInfoParams),
    async ({ pageParam = 0 }) => fetchReviewInfo({ ...reviewInfoParams, page: pageParam }),
    {
      getNextPageParam: (nextData) => {
        const { sellerReviews: { number = 0, totalPages = 0 } = {} } = nextData || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor = scrollTop + clientHeight >= scrollHeight;

      if (hasNextPage && !isFetchingNextPage && isFloor) {
        const requestReviewsPage = productsPage.current + 1;
        logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
          title: 'SELLER_REVIEW',
          name: 'SELLER_REVIEW',
          page: requestReviewsPage,
          sellerId: id
        });
        await fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, id]);

  const firstReviewInfo = data?.pages?.[0];
  const isEmpty = firstReviewInfo?.sellerReviews?.content?.length === 0;
  const isCamelProduct = PRODUCT_SITE.CAMEL.id === firstReviewInfo?.productSeller.site?.id;
  const isCamelSeller =
    firstReviewInfo &&
    SELLER_STATUS[firstReviewInfo.productSeller.type as keyof typeof SELLER_STATUS] ===
      SELLER_STATUS['3'];

  const isNormalseller =
    (firstReviewInfo?.site.id === 34 || firstReviewInfo?.productSeller.type === 4) &&
    firstReviewInfo?.productSeller.type !== 3;

  const handleClickCard = () => {
    setReviewBlockState(true);
    queryClient.invalidateQueries(id);
  };

  return (
    <Box customStyle={{ margin: '16px 0 20px' }}>
      <Alert
        round="16"
        customStyle={{
          padding: '12px 24px',
          marginBottom: 32
        }}
      >
        <Typography variant="body2">판매자의 최근 후기만 보여드려요</Typography>
      </Alert>
      {firstReviewInfo && (
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{
            marginBottom: 16
          }}
        >
          <Typography variant="h4" weight="bold">
            {firstReviewInfo.productSeller.name} 님이 받은 후기
            {/* {isNormalseller
              ? `$`
              : `${
                  (firstReviewInfo.siteUrl?.name || firstReviewInfo.site.name) ?? ''
                }에서 받은 후기`} */}
          </Typography>
          <Flexbox gap={12} alignment="center">
            {isCamelProduct && !isNormalseller && (
              <Flexbox alignment="center">
                <Typography variant="h4" weight="bold">
                  카멜우수판매자
                </Typography>
              </Flexbox>
            )}
            {isCamelSeller && !isNormalseller && (
              <Flexbox alignment="center">
                <Icon name="SafeFilled" customStyle={{ color: primary.main }} />
                <Typography variant="h4" weight="bold">
                  카멜인증판매자
                </Typography>
              </Flexbox>
            )}
            <Typography variant="h4" weight="bold">
              {firstReviewInfo.curnScore || '0'}
              {firstReviewInfo.maxScore ? `/${firstReviewInfo.maxScore}` : ''}
            </Typography>
          </Flexbox>
        </Flexbox>
      )}
      {isEmpty && (
        <Alert
          round="16"
          customStyle={{
            padding: '12px 24px',
            marginBottom: 32
          }}
        >
          <Typography variant="body2">등록된 후기가 없어요</Typography>
        </Alert>
      )}
      {isLoading && (
        <Flexbox gap={8} justifyContent="space-between" customStyle={{ marginBottom: 16 }}>
          <Skeleton width="100%" maxWidth="80px" height="24px" disableAspectRatio />
          <Skeleton width="100%" maxWidth="120px" height="24px" disableAspectRatio />
        </Flexbox>
      )}
      {isLoading && (
        <Flexbox direction="vertical" gap={8}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`seller-review-card-${index}`}
              width="100%"
              height="62px"
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
            />
          ))}
        </Flexbox>
      )}
      {!isLoading &&
        data?.pages?.map((reviewInfo) =>
          reviewInfo?.sellerReviews?.content?.map((sellerReview) => (
            <SellerInfoReviewCard
              key={`seller-review-card-${sellerReview.id}`}
              sellerReview={sellerReview}
              site={reviewInfo.site || {}}
              curnScore={reviewInfo.curnScore}
              maxScore={reviewInfo.maxScore}
              productId={sellerReview.productId}
              onReport={() => {
                handleClickCard();
                setToastState(() => ({ type: 'report', open: true }));
              }}
              onBlock={() => {
                handleClickCard();
                setToastState(() => ({ type: 'block', open: true }));
              }}
            />
          ))
        )}
      <Toast
        open={toastState.open}
        onClose={() => setToastState(() => ({ type: null, open: false }))}
        autoHideDuration={1500}
      >
        {toastState.type === 'report' && (
          <>
            신고가 접수되었습니다.
            <br />이 리뷰는 가려드릴게요!
          </>
        )}
        {toastState.type === 'block' && (
          <>
            차단 처리되었습니다.
            <br />이 사용자는 가려드릴게요!
          </>
        )}
      </Toast>
    </Box>
  );
}

export default SellerInfoReviewsPanel;
