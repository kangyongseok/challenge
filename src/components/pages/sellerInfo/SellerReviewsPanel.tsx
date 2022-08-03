import { useEffect, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { fetchReviewInfo } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import atom from '@recoil/productReview';

import ReviewCard from './ReviewCard';

function SellerReviewsPanel() {
  const {
    query: { id: productId }
  } = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const [toastState, setToastState] = useState<{ type: null | 'report' | 'block'; open: boolean }>({
    type: null,
    open: false
  });
  const setReviewBlockState = useSetRecoilState(atom.reviewBlockState);
  const reviewInfoParams = {
    productId: Number(productId),
    size: 20
  };
  const { ref, inView } = useInView();
  const productsPage = useRef(0);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
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
    if (inView) {
      const requestReviewsPage = productsPage.current + 1;
      logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
        title: 'SELLER_REVIEW',
        name: 'SELLER_REVIEW',
        page: requestReviewsPage,
        productId
      });
      fetchNextPage();
    }
  }, [fetchNextPage, inView, productId]);

  const firstReviewInfo = data?.pages?.[0];
  const isEmpty = firstReviewInfo?.sellerReviews?.content?.length === 0;
  const isCamelProduct = PRODUCT_SITE.CAMEL.id === firstReviewInfo?.productSeller.site?.id;
  const isCamelSeller =
    firstReviewInfo &&
    SELLER_STATUS[firstReviewInfo.productSeller.type as keyof typeof SELLER_STATUS] ===
      SELLER_STATUS['3'];

  const handleClickCard = () => {
    setReviewBlockState(true);
    queryClient.invalidateQueries(productId);
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
        <Typography variant="body2" color={palette.common.grey['20']}>
          판매자의 최근 후기만 보여드려요
        </Typography>
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
            {(firstReviewInfo.siteUrl.name || firstReviewInfo.site.name) ?? ''}에서 받은 후기
          </Typography>
          <Flexbox gap={12}>
            {isCamelProduct && (
              <Flexbox alignment="center">
                <Typography variant="h4" weight="bold">
                  카멜우수판매자
                </Typography>
              </Flexbox>
            )}
            {isCamelSeller && (
              <Flexbox alignment="center">
                <Icon name="SafeFilled" customStyle={{ color: palette.primary.main }} />
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
          <Typography variant="body2" color={palette.common.grey['20']}>
            등록된 후기가 없어요
          </Typography>
        </Alert>
      )}
      {data?.pages?.map((reviewInfo) =>
        reviewInfo?.sellerReviews?.content?.map((sellerReview) => (
          <ReviewCard
            key={`seller-review-card-${sellerReview.id}`}
            sellerReview={sellerReview}
            site={reviewInfo.site || {}}
            curnScore={reviewInfo.curnScore}
            maxScore={reviewInfo.maxScore}
            productId={Number(productId)}
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
      {!isFetchingNextPage && hasNextPage && (
        <Box
          ref={ref}
          customStyle={{
            height: 20
          }}
        />
      )}
      <Toast
        open={toastState.open}
        onClose={() => setToastState(() => ({ type: null, open: false }))}
        autoHideDuration={1500}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
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
        </Typography>
      </Toast>
    </Box>
  );
}

export default SellerReviewsPanel;
