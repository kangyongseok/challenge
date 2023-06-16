import { memo, useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Flexbox, Rating, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { AccessUser } from '@dto/userAuth';
import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchReviewInfo } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { REPORT_STATUS } from '@constants/product';
import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';

import { pulse } from '@styles/transition';

import { reviewBlockState } from '@recoil/productReview';
import useProductType from '@hooks/useProductType';

function ProductSellerReviews({
  product,
  roleSellerUserId
}: {
  product?: Product;
  roleSellerUserId?: number;
}) {
  const router = useRouter();
  const [reviewBlock, setReviewBlockState] = useRecoilState(reviewBlockState);
  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);

  const sellerId = product?.productSeller.id || 0;

  const [reviewInfoParams, setReviewInfoParams] = useState({
    sellerId,
    size: 3
  });

  const queryClient = useQueryClient();

  const { data: reviewInfo } = useQuery(
    queryKeys.products.reviewInfo(reviewInfoParams),
    () => fetchReviewInfo(reviewInfoParams),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled: !!reviewInfoParams.sellerId
    }
  );

  const { isAllCrawlingProduct } = useProductType(reviewInfo?.sellerType);

  const handleClickMoreList = () => {
    if (product)
      productDetailAtt({
        key: attrKeys.products.CLICK_SELLER_PRODUCT,
        product,
        rest: {
          att: 'ALL'
        },
        source: attrProperty.productSource.PRODUCT_LIST
      });
    // 내 매물 shop

    if (roleSellerUserId && accessUser?.userId && roleSellerUserId === accessUser?.userId) {
      router.push({
        pathname: '/user/shop',
        query: { tab: 0 }
      });
      return;
    }

    // 크롤링 판매자 정보 sellerInfo
    // 일반 or 인증 사용자 정보 userInfo
    router.push({
      pathname: isAllCrawlingProduct ? `/sellerInfo/${sellerId}` : `/userInfo/${roleSellerUserId}`,
      query: {
        tab: 'reviews'
      }
    });
  };

  useEffect(() => {
    if (sellerId)
      setReviewInfoParams({
        sellerId,
        size: 3
      });
  }, [sellerId]);

  useEffect(() => {
    if (reviewBlock) {
      setReviewBlockState(false);
      queryClient.invalidateQueries(queryKeys.products.reviewInfo(reviewInfoParams));
    }
  }, [reviewBlock, reviewInfoParams, queryClient, setReviewBlockState]);

  useEffect(() => {
    setReviewInfoParams((props) => ({ ...props, sellerId }));
  }, [sellerId]);

  return reviewInfo?.sellerReviews?.totalElements ? (
    <Box>
      <Flexbox
        alignment="center"
        customStyle={{ margin: '52px 0 20px' }}
        onClick={() => {
          if (product)
            productDetailAtt({
              key: attrKeys.products.CLICK_SELLER_REVIEW,
              product,
              rest: {
                att: 'ALL'
              },
              source: attrProperty.productSource.PRODUCT_LIST
            });

          router.push({
            pathname: isAllCrawlingProduct
              ? `/sellerInfo/${sellerId}`
              : `/userInfo/${roleSellerUserId}`,
            query: {
              tab: 'reviews'
            }
          });
        }}
      >
        <Flexbox alignment="center" customStyle={{ marginRight: 'auto' }}>
          <Typography variant="h3" weight="bold">
            판매자 후기 {reviewInfo.sellerReviews?.content.length}
          </Typography>
        </Flexbox>
        {/* <Icon
          name="CaretRightOutlined"
          size="medium"
          color="ui60"
          customStyle={{ marginLeft: 5 }}
        /> */}
      </Flexbox>
      {!reviewInfo?.sellerReviews
        ? Array.from({ length: 2 }, (_, index) => (
            <ReviewCardSkeleton key={`review-loading-${index}`} />
          ))
        : reviewInfo.sellerReviews?.content
            .slice(0, 2)
            ?.map(({ id: sellerReviewId, reportStatus, creator, content, score }) => (
              <ReviewCard key={`review-${sellerReviewId}`}>
                {REPORT_STATUS[reportStatus as keyof typeof REPORT_STATUS] === REPORT_STATUS[0] && (
                  <>
                    <Flexbox alignment="center" justifyContent="space-between">
                      <Typography variant="body2" weight="medium">
                        {creator}
                      </Typography>
                      {!Number.isNaN(Number(reviewInfo.curnScore)) &&
                        Math.floor(Number(score) / 2) !== 0 && (
                          <Rating
                            count={5}
                            value={
                              reviewInfo.maxScore === '10'
                                ? Math.floor(Number(score) / 2)
                                : Number(score)
                            }
                          />
                        )}
                    </Flexbox>
                    <ReviewContent variant="body2">{content}</ReviewContent>
                  </>
                )}
                {REPORT_STATUS[reportStatus as keyof typeof REPORT_STATUS] === REPORT_STATUS[1] && (
                  <ReviewContent variant="body2">신고에 의해 숨김 처리된 리뷰입니다.</ReviewContent>
                )}
                {REPORT_STATUS[reportStatus as keyof typeof REPORT_STATUS] === REPORT_STATUS[2] && (
                  <ReviewContent variant="body2">차단하신 사용자의 리뷰입니다.</ReviewContent>
                )}
              </ReviewCard>
            ))}
      <Button
        fullWidth
        size="large"
        variant="ghost"
        brandColor="black"
        customStyle={{ marginTop: 20 }}
        onClick={handleClickMoreList}
      >
        후기 더보기
      </Button>
    </Box>
  ) : null;
}

const ReviewCard = styled.div`
  margin-top: 8px;
  padding: 12px 16px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui98};
  border-radius: ${({ theme }) => theme.box.round['8']};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ReviewCardSkeleton = styled(ReviewCard)`
  height: 64px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
  animation: ${pulse} 800ms linear 0s infinite alternate;
`;

const ReviewContent = styled(Typography)`
  margin-top: 4px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export default memo(ProductSellerReviews);
