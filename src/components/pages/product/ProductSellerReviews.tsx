import { memo, useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Rating, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';

import type { Product } from '@dto/product';

import { fetchReviewInfo } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE, REPORT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { commaNumber } from '@utils/common';

import { pulse } from '@styles/transition';

import atom from '@recoil/productReview';

function ProductSellerReviews({ product }: { product?: Product }) {
  const { push } = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [reviewBlockState, atomReviewBlockState] = useRecoilState(atom.reviewBlockState);

  // const splitIds = String(id).split('-');
  // const productId = Number(splitIds[splitIds.length - 1] || 0);
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

  useEffect(() => {
    if (sellerId)
      setReviewInfoParams({
        sellerId,
        size: 3
      });
  }, [sellerId]);

  useEffect(() => {
    if (reviewBlockState) {
      atomReviewBlockState(false);
      queryClient.invalidateQueries(queryKeys.products.reviewInfo(reviewInfoParams));
    }
  }, [reviewBlockState, reviewInfoParams, queryClient, atomReviewBlockState]);

  useEffect(() => {
    setReviewInfoParams((props) => ({ ...props, sellerId }));
  }, [sellerId]);

  const isCamelProduct = PRODUCT_SITE.CAMEL.id === reviewInfo?.productSeller?.site?.id;
  const isCamelSeller =
    reviewInfo &&
    SELLER_STATUS[reviewInfo.productSeller.type as keyof typeof SELLER_STATUS] ===
      SELLER_STATUS['3'];
  return reviewInfo?.sellerReviews?.totalElements ? (
    <Box customStyle={{ marginTop: 32 }}>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        onClick={() => {
          productDetailAtt({
            key: attrKeys.products.CLICK_SELLER_REVIEW,
            product: product as Product,
            rest: {
              attr: 'ALL'
            },
            source: attrProperty.productSource.PRODUCT_LIST
          });
          push(`/products/${sellerId}/sellerInfo?tab=reviews`);
        }}
      >
        <Flexbox alignment="center">
          <Typography variant="h4" weight="bold">
            판매자 리뷰
          </Typography>
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{ marginLeft: 4, color: common.ui80 }}
          >
            ({commaNumber(reviewInfo.totalCount || reviewInfo?.sellerReviews.totalElements || 0)}
            개)
          </Typography>
        </Flexbox>
        <Icon name="CaretRightOutlined" size="medium" />
      </Flexbox>
      <Flexbox justifyContent="space-between" alignment="center" customStyle={{ marginTop: 16 }}>
        <Flexbox alignment="center">
          {reviewInfo ? (
            (isCamelProduct && (
              <Avatar
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/user-camel.png`}
                customStyle={{ borderRadius: '50%' }}
              />
            )) ||
            (isCamelSeller && (
              <Avatar
                src={`https://${process.env.IMAGE_DOMAIN}/product/seller/${reviewInfo.productSeller.id}.png`}
                customStyle={{ borderRadius: '50%' }}
              />
            ))
          ) : (
            <Icon name="UserFilled" width={20} color={common.ui95} />
          )}
          <ProductSellerName
            variant="body1"
            weight="medium"
            hasName={!!reviewInfo?.productSeller.name}
          >
            {reviewInfo?.productSeller.name}
          </ProductSellerName>
        </Flexbox>
        <Flexbox alignment="center" gap={12}>
          {isCamelProduct && (
            <Flexbox alignment="center">
              <Typography variant="body2" weight="bold">
                카멜우수판매자
              </Typography>
            </Flexbox>
          )}
          {isCamelSeller && (
            <Flexbox alignment="center">
              <Icon name="SafeFilled" size="small" customStyle={{ color: primary.main }} />
              <Typography variant="body2" weight="bold">
                카멜인증판매자
              </Typography>
            </Flexbox>
          )}
          {reviewInfo?.curnScore && (
            <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
              {`${
                reviewInfo.curnScore.length > 1
                  ? reviewInfo?.curnScore
                  : `${reviewInfo?.curnScore}.0` || 0
              }${reviewInfo?.maxScore ? `/${reviewInfo?.maxScore}` : ''}`}
            </Typography>
          )}
        </Flexbox>
      </Flexbox>
      {!reviewInfo?.sellerReviews
        ? Array.from({ length: 3 }, (_, index) => (
            <ReviewCardSkeleton key={`review-loading-${index}`} />
          ))
        : reviewInfo.sellerReviews.content.map(
            ({ id: sellerReviewId, reportStatus, creator, content, score }) => (
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
            )
          )}
      <Divider />
    </Box>
  ) : null;
}

const ProductSellerName = styled(Typography)<{ hasName: boolean }>`
  margin-left: 6px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;

  ${({
    theme: {
      box,
      palette: { common }
    },
    hasName
  }) =>
    !hasName && {
      height: '21px',
      width: '50px',
      borderRadius: box.round['4'],
      backgroundColor: common.ui90,
      animation: `${pulse} 800ms linear 0s infinite alternate`
    }}
`;

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
