import { memo, useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useQueries } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { NewProductGridCard } from '@components/UI/molecules';
import { CamelAuthLabel } from '@components/UI/atoms';

import type { AccessUser } from '@dto/userAuth';
import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchReviewInfo, fetchSellerProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { getFormattedActivatedTime } from '@utils/formats';
import { commaNumber } from '@utils/common';

import { pulse } from '@styles/transition';

import useProductType from '@hooks/useProductType';
import useProductSellerType from '@hooks/useProductSellerType';

function ProductSellerProductList({
  product,
  roleSellerUserId
}: {
  product?: Product;
  roleSellerUserId?: number;
}) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, primary, secondary }
    }
  } = useTheme();
  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);
  const sellerId = Number(product?.productSeller.id || 0);

  const [sellerProductsParams, setSellerProductsParams] = useState({
    sellerId,
    page: 0,
    size: 20
  });
  const [reviewInfoParams, setReviewInfoParams] = useState({
    sellerId,
    size: 3
  });
  const [loadFail, setLoadFail] = useState(false);
  const [
    {
      data: sellerProducts,
      isLoading: sellerProductsIsLoading,
      isFetching: sellerProductsIsFetching,
      isError: sellerProductsIsError
    },
    {
      data: reviewInfo,
      isLoading: reviewInfoIsLoading,
      isFetching: reviewInfoIsFetching,
      isError: reviewInfoIsError
    }
  ] = useQueries({
    queries: [
      {
        queryKey: queryKeys.products.sellerProducts(sellerProductsParams),
        queryFn: () => fetchSellerProducts(sellerProductsParams),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000
      },
      {
        queryKey: queryKeys.products.reviewInfo(reviewInfoParams),
        queryFn: () => fetchReviewInfo(reviewInfoParams),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000
      }
    ]
  });

  const { isCertificationSeller } = useProductSellerType({
    productSellerType: reviewInfo?.productSeller?.type
  });

  const { isAllCrawlingProduct, isNormalProduct } = useProductType(product?.sellerType);

  const getTimeForamt = getFormattedActivatedTime(reviewInfo?.dateActivated || '');

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
        tab: 'products'
      }
    });
  };

  useEffect(() => {
    if (sellerProductsParams.sellerId !== sellerId) {
      setSellerProductsParams({
        ...sellerProductsParams,
        sellerId
      });
      setReviewInfoParams({ ...reviewInfoParams, sellerId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  return sellerProductsIsLoading ||
    reviewInfoIsLoading ||
    sellerProductsIsFetching ||
    reviewInfoIsFetching ||
    sellerProductsIsError ||
    reviewInfoIsError ||
    (reviewInfo?.productSeller?.count || 0) > 0 ? (
    <Box
      component="section"
      customStyle={{
        paddingTop: 32
      }}
    >
      <Flexbox alignment="center" justifyContent="space-between" onClick={handleClickMoreList}>
        <Flexbox alignment="flex-start" customStyle={{ width: '100%' }}>
          {!loadFail && reviewInfo?.productSeller?.image ? (
            <UserAvatar>
              <Image
                src={reviewInfo?.productSeller?.image}
                alt="프로필 이미지"
                round="50%"
                onError={() => setLoadFail(true)}
                customStyle={{
                  borderRadius: '50%'
                }}
              />
            </UserAvatar>
          ) : (
            <EmptyAvatar justifyContent="center" alignment="center">
              <Icon name="UserFilled" size="large" />
            </EmptyAvatar>
          )}
          <Flexbox direction="vertical">
            <Flexbox gap={6} alignment="center">
              <ProductSellerName
                variant="h3"
                weight="bold"
                hasName={!!reviewInfo?.productSeller?.name}
                isCamelSeller={!!isCertificationSeller}
                isNormalSeller={isNormalProduct}
              >
                {reviewInfo?.productSeller?.name}
              </ProductSellerName>
              {isCertificationSeller && !isNormalProduct && <CamelAuthLabel />}
            </Flexbox>
            <Flexbox alignment="center" gap={8}>
              {reviewInfo?.dateActivated && (
                <Flexbox alignment="center">
                  {getTimeForamt.icon === 'time' ? (
                    <Icon
                      name="TimeOutlined"
                      color={getTimeForamt.icon === 'time' ? 'ui60' : 'primary-light'}
                      customStyle={{
                        marginRight: 2,
                        height: '14px !important',
                        width: 14
                      }}
                    />
                  ) : (
                    <Box
                      customStyle={{
                        width: 5,
                        height: 5,
                        background: getTimeForamt.icon === 'time' ? common.ui60 : primary.light,
                        borderRadius: '50%',
                        marginRight: 5
                      }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    color={getTimeForamt.icon === 'time' ? 'ui60' : 'primary-light'}
                  >
                    {getTimeForamt.text}
                  </Typography>
                </Flexbox>
              )}
              <Flexbox alignment="center" gap={4}>
                {reviewInfo?.curnScore && (
                  <Flexbox alignment="center" gap={2}>
                    <Icon name="StarFilled" color="#FFD911" size="small" />
                    <Typography variant="body2" weight="medium" color="ui60">
                      {`${
                        reviewInfo.curnScore.length > 1
                          ? reviewInfo?.curnScore
                          : `${reviewInfo?.curnScore}.0` || 0
                      }`}{' '}
                    </Typography>
                  </Flexbox>
                )}
                <Typography variant="body2" weight="medium" color="ui60">
                  •
                </Typography>
                <Typography variant="body2" color="ui60">
                  {commaNumber(sellerProducts?.totalElements || 0)}개 판매 중
                </Typography>
              </Flexbox>
            </Flexbox>
          </Flexbox>
          <Flexbox customStyle={{ marginLeft: 'auto', marginTop: 5, cursor: 'pointer' }}>
            <Typography weight="medium" variant="body2">
              더보기
            </Typography>
            <Icon name="CaretRightOutlined" size="small" />
          </Flexbox>
        </Flexbox>
      </Flexbox>
      {isCertificationSeller && !isNormalProduct && (
        <Box
          customStyle={{
            background: secondary.blue.bgLight,
            borderRadius: 8,
            padding: 12,
            marginTop: 20
          }}
        >
          <Flexbox alignment="flex-start" gap={6}>
            <Icon name="ShieldFilled" size="medium" customStyle={{ marginTop: -2 }} />
            <Typography weight="medium" variant="body2">
              카멜이 직접 인증한 판매자예요. 편하게 문의해보세요.
            </Typography>
          </Flexbox>
          <Typography variant="body2" color="ui60" customStyle={{ paddingLeft: 25 }}>
            가품시, 100% 환불
          </Typography>
        </Box>
      )}
      {!!sellerProducts?.totalElements && (
        <>
          <Typography variant="h3" weight="bold" customStyle={{ margin: '52px 0 20px' }}>
            판매자 매물 {commaNumber(sellerProducts?.totalElements || 0)}
          </Typography>
          <ProductList>
            {!sellerProducts?.content
              ? Array.from({ length: 5 }, (_, index) => (
                  <ImageSkeleton key={`seller-product-${index}`} />
                ))
              : sellerProducts.content?.map((sellerProduct, index) => (
                  <Box customStyle={{ flex: 1 }} key={`related-product-${sellerProduct.id}`}>
                    <NewProductGridCard
                      variant="swipeX"
                      product={sellerProduct}
                      hideAreaInfo
                      attributes={{
                        index: index + 1,
                        source: attrProperty.source.PRODUCT_DETAIL_SELLER_INFO
                      }}
                    />
                  </Box>
                ))}
          </ProductList>
          <Button
            fullWidth
            variant="ghost"
            brandColor="black"
            size="large"
            customStyle={{ marginTop: 20 }}
            onClick={handleClickMoreList}
          >
            매물 더보기
          </Button>
        </>
      )}
    </Box>
  ) : null;
}

const ProductList = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 144px;
  gap: 12px;
  margin: 0 -20px;
  padding: 0 20px 0;
  overflow-x: auto;
  justify-content: flex-start;
`;

const ImageSkeleton = styled.div`
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
  animation: ${pulse} 800ms linear 0s infinite alternate;
  width: 96px;
  height: 96px;
  border-radius: 8px;
`;

const ProductSellerName = styled(Typography)<{
  hasName: boolean;
  isCamelSeller: boolean;
  isNormalSeller: boolean;
}>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
  color: ${({ theme: { palette } }) => palette.common.ui20};
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

const UserAvatar = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  overflow: hidden;
  margin-right: 12px;
  * {
    border-radius: 50%;
  }
`;

const EmptyAvatar = styled(Flexbox)`
  width: 44px;
  height: 44px;
  background: ${({ theme: { palette } }) => palette.common.bg02};
  border-radius: 50%;
  margin-right: 12px;

  svg {
    color: ${({ theme: { palette } }) => palette.common.ui80};
  }
`;

export default memo(ProductSellerProductList);
