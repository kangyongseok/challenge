import { memo, useEffect, useState } from 'react';

import { useQueries } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider, ProductGridCard } from '@components/UI/molecules';

import { AccessUser } from '@dto/userAuth';
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

function ProductSellerProductList({ product }: { product?: Product }) {
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
          productDetailAtt({
            key: attrKeys.products.CLICK_SELLER_PRODUCT,
            product: product as Product,
            rest: {
              attr: 'ALL'
            },
            source: attrProperty.productSource.PRODUCT_LIST
          });
          router.push({
            pathname: `/sellerInfo/${sellerId}`,
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
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/user-camel.png`}
                customStyle={{ borderRadius: '50%', marginRight: 12 }}
                width={44}
              />
            )) ||
            (isCamelSeller && (
              <Avatar
                src={`https://${process.env.IMAGE_DOMAIN}/product/seller/${reviewInfo.productSeller.id}.png`}
                customStyle={{ borderRadius: '50%', marginRight: 12 }}
                width={44}
              />
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
              >
                {reviewInfo?.productSeller?.name}
              </ProductSellerName>
              {isCamelSeller && (
                <Icon name="SafeFilled" size="large" customStyle={{ color: primary.main }} />
              )}
            </Flexbox>
            <Typography customStyle={{ color: common.ui60 }}>
              {isCamelSeller ? '카멜인증판매자 ∙ ' : ''}
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
                  // wishAtt={handleWishAtt(product, i)}
                  // productAtt={handleProductAtt(product, i)}
                  name={attrProperty.productName.PRODUCT_DETAIL}
                  isRound
                  compact
                  gap={17}
                  source={attrProperty.productSource.LIST_RELATED}
                  hideProductLabel
                  hideAreaWithDateInfo
                  hideWishButton={Number(product?.productSeller.account) === accessUser?.userId}
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
  /* grid-auto-rows: 96px; */
  gap: 12px;
  margin: 0 -20px;
  padding: 0 20px 0;
  overflow-x: auto;
  /* overflow-x: auto;
  overflow-y: hidden; */
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

const ProductSellerName = styled(Typography)<{ hasName: boolean; isCamelSeller: boolean }>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
  color: ${({ isCamelSeller, theme: { palette } }) =>
    isCamelSeller ? palette.primary.main : palette.common.ui20};
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
