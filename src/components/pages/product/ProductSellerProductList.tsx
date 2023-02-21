import { memo, useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import { useQueries } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { Divider, ProductGridCard } from '@components/UI/molecules';

import type { AccessUser } from '@dto/userAuth';
import type { Product, ProductResult } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchReviewInfo, fetchSellerProducts } from '@api/product';

import { SELLER_STATUS, productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { ACCESS_USER } from '@constants/localStorage';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { commaNumber } from '@utils/common';

import { pulse } from '@styles/transition';

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

  const isCamelSeller =
    reviewInfo &&
    SELLER_STATUS[reviewInfo.productSeller.type as keyof typeof SELLER_STATUS] ===
      SELLER_STATUS['3'];
  const isNormalseller = product?.sellerType === productSellerType.normal;

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
      pathname:
        product?.sellerType === productSellerType.collection
          ? `/sellerInfo/${sellerId}`
          : `/userInfo/${roleSellerUserId}`,
      query: {
        tab: 'products'
      }
    });
  };

  const handleWishAtt = (productResult: ProductResult, i: number) => {
    return {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.SELLER_INFO,
      id: productResult.id,
      index: i + 1,
      brand: productResult.brand.name,
      category: productResult.category.name,
      parentId: productResult.category.parentId,
      site: productResult.site.name,
      price: productResult.price,
      scoreTotal: productResult.scoreTotal,
      cluster: productResult.cluster,
      source: attrProperty.source.PRODUCT_DETAIL_SELLER_INFO,
      sellerType: productResult.sellerType
    };
  };

  const handleProductAtt = (productResult: ProductResult, i: number) => {
    return {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.SELLER_INFO,
      index: i + 1,
      id: productResult.id,
      brand: productResult.brand.name,
      category: productResult.category.name,
      parentCategory: FIRST_CATEGORIES[productResult.category.parentId as number],
      site: productResult.site.name,
      price: productResult.price,
      source: attrProperty.source.PRODUCT_DETAIL_SELLER_INFO,
      sellerType: productResult.sellerType
    };
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
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ marginBottom: 20 }}
        onClick={handleClickMoreList}
      >
        <Flexbox alignment="flex-start" customStyle={{ width: '100%' }}>
          {reviewInfo?.productSeller.image ? (
            <UserAvatar>
              <Image
                src={`${reviewInfo?.productSeller.image}`}
                alt="프로필 이미지"
                round="50%"
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
          <Flexbox customStyle={{ marginLeft: 'auto', marginTop: 5, cursor: 'pointer' }}>
            <Typography weight="medium" variant="body2">
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
          : sellerProducts.content?.map((sellerProduct, i) => (
              <Box customStyle={{ flex: 1 }} key={`related-product-${sellerProduct.id}`}>
                <ProductGridCard
                  product={sellerProduct}
                  wishAtt={handleWishAtt(sellerProduct, i)}
                  productAtt={handleProductAtt(sellerProduct, i)}
                  name={attrProperty.productName.PRODUCT_DETAIL}
                  isRound
                  compact
                  gap={17}
                  source={attrProperty.source.PRODUCT_DETAIL_SELLER_INFO}
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
