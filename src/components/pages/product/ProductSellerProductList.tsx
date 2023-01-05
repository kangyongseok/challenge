import { memo, useEffect, useState } from 'react';

import { useQueries } from 'react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Avatar, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider, ProductGridCard } from '@components/UI/molecules';

import type { AccessUser } from '@dto/userAuth';
import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchReviewInfo, fetchSellerProducts } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE } from '@constants/product';
import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { commaNumber } from '@utils/common';

import { pulse } from '@styles/transition';

const NEXT_IMAGE_BLUR_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

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
      palette: { common, primary }
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
  ] = useQueries([
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
  ]);

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

  const isCamelProduct = PRODUCT_SITE.CAMEL.id === reviewInfo?.productSeller?.site?.id;
  const isCamelSeller =
    reviewInfo &&
    SELLER_STATUS[reviewInfo.productSeller.type as keyof typeof SELLER_STATUS] ===
      SELLER_STATUS['3'];

  const isNormalseller =
    (reviewInfo?.site.id === 34 || reviewInfo?.productSeller.type === 4) &&
    reviewInfo?.productSeller.type !== 3;

  return sellerProductsIsLoading ||
    reviewInfoIsLoading ||
    sellerProductsIsFetching ||
    reviewInfoIsFetching ||
    sellerProductsIsError ||
    reviewInfoIsError ||
    (reviewInfo?.productSeller?.count || 0) > 0 ? (
    <Box>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ marginBottom: 20 }}
        onClick={() => {
          if (product)
            productDetailAtt({
              key: attrKeys.products.CLICK_SELLER_PRODUCT,
              product,
              rest: {
                attr: 'ALL'
              },
              source: attrProperty.productSource.PRODUCT_LIST
            });
          router.push({
            pathname:
              product?.site.id === 34 ? `/userInfo/${roleSellerUserId}` : `/sellerInfo/${sellerId}`,
            query: {
              tab: 'products'
            }
          });
        }}
      >
        <Flexbox alignment="flex-start" customStyle={{ width: '100%' }}>
          {reviewInfo ? (
            (isCamelProduct && (
              <Avatar
                width={44}
                height={44}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/user-camel.png`}
                alt="프로필 이미지"
                round="50%"
                customStyle={{ marginRight: 12 }}
              />
            )) ||
            (isCamelSeller && (
              <Box
                customStyle={{
                  position: 'relative',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: common.bg02,
                  overflow: 'hidden',
                  marginRight: 12
                }}
              >
                <Image
                  src={`https://${process.env.IMAGE_DOMAIN}/product/seller/${reviewInfo.productSeller.id}.png`}
                  alt={`${product?.productSeller.name} 프로필 이미지`}
                  placeholder="blur"
                  blurDataURL={NEXT_IMAGE_BLUR_URL}
                  layout="fill"
                  objectFit="cover"
                  style={{ borderRadius: '50%' }}
                />
              </Box>
            )) ||
            (reviewInfo.productSeller.image && (
              <Box
                customStyle={{
                  position: 'relative',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: common.bg02,
                  overflow: 'hidden',
                  marginRight: 12
                }}
              >
                <Image
                  src={`${reviewInfo.productSeller.image}`}
                  alt="프로필 이미지"
                  placeholder="blur"
                  blurDataURL={NEXT_IMAGE_BLUR_URL}
                  layout="fill"
                  objectFit="cover"
                  style={{ borderRadius: '50%' }}
                />
              </Box>
            )) || (
              <EmptyAvatar justifyContent="center" alignment="center">
                <Icon name="UserFilled" size="large" />
              </EmptyAvatar>
            )
          ) : (
            <Icon name="UserFilled" width={20} color={common.ui95} />
          )}
          <Flexbox direction="vertical">
            <Flexbox gap={6} alignment="center">
              <ProductSellerName
                variant="h3"
                weight="bold"
                hasName={!!reviewInfo?.productSeller?.name}
                isCamelSeller={!!isCamelSeller}
                isNormalSeller={isNormalseller}
              >
                {reviewInfo?.productSeller?.name}
              </ProductSellerName>
              {isCamelSeller && !isNormalseller && (
                <Icon name="SafeFilled" size="large" customStyle={{ color: primary.main }} />
              )}
            </Flexbox>
            <Typography customStyle={{ color: common.ui60 }}>
              {!isNormalseller && isCamelSeller ? '카멜인증판매자 ∙ ' : ''}
              {commaNumber(sellerProducts?.totalElements || 0)}개 판매 중
            </Typography>
          </Flexbox>
          <Flexbox customStyle={{ marginLeft: 'auto', marginTop: 5 }}>
            <Typography weight="medium" variant="small1">
              더보기
            </Typography>
            <Icon name="CaretRightOutlined" size="small" />
          </Flexbox>
        </Flexbox>
      </Flexbox>
      <ProductList>
        {!sellerProducts?.content
          ? Array.from({ length: 5 }, (_, index) => (
              <ImageSkeleton key={`seller-product-${index}`} />
            ))
          : sellerProducts.content.map((sellerProduct) => (
              <Box customStyle={{ flex: 1 }} key={`related-product-${sellerProduct.id}`}>
                <ProductGridCard
                  product={sellerProduct}
                  name={attrProperty.productName.PRODUCT_DETAIL}
                  isRound
                  compact
                  gap={17}
                  source={attrProperty.productSource.LIST_RELATED}
                  hideProductLabel
                  hideAreaWithDateInfo
                  hideWishButton={roleSellerUserId === accessUser?.userId}
                />
              </Box>
            ))}
      </ProductList>
      <Divider />
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
  color: ${({ isCamelSeller, isNormalSeller, theme: { palette } }) =>
    isCamelSeller && !isNormalSeller ? palette.primary.main : palette.common.ui20};
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
