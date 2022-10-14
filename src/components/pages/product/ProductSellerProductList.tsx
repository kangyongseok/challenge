import { memo, useEffect, useState } from 'react';

import { useQueries } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';
import Image from '@components/UI/atoms/Image';

import type { Product } from '@dto/product';

import { fetchReviewInfo, fetchSellerProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { commaNumber } from '@utils/common';

import { pulse } from '@styles/transition';

function ProductSellerProductList({ product }: { product?: Product }) {
  const { push } = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  // const splitIds = String(id).split('-');
  // const productId = Number(splitIds[splitIds.length - 1] || 0);
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

  return sellerProductsIsLoading ||
    reviewInfoIsLoading ||
    sellerProductsIsFetching ||
    reviewInfoIsFetching ||
    sellerProductsIsError ||
    reviewInfoIsError ||
    (reviewInfo?.productSeller?.count || 0) > 0 ? (
    <Box customStyle={{ marginTop: 32 }}>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        onClick={() => {
          productDetailAtt({
            key: attrKeys.products.CLICK_SELLER_PRODUCT,
            product: product as Product,
            rest: {
              attr: 'ALL'
            },
            source: attrProperty.productSource.PRODUCT_LIST
          });
          push(`/products/${sellerId}/sellerInfo?tab=products`);
        }}
      >
        <Flexbox alignment="center">
          <Typography variant="h4" weight="bold">
            이 판매자의 매물
          </Typography>
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{ marginLeft: 4, color: common.ui60 }}
          >
            ({commaNumber(sellerProducts?.totalElements || 0)}개)
          </Typography>
        </Flexbox>
        <Icon name="CaretRightOutlined" size="medium" />
      </Flexbox>

      <ProductList>
        {!sellerProducts?.content
          ? Array.from({ length: 5 }, (_, index) => (
              <ImageSkeleton key={`seller-product-${index}`} />
            ))
          : sellerProducts.content.map(({ id: sellerProductId, imageThumbnail, imageMain }) => (
              <Image
                key={`seller-product-${sellerProductId}`}
                width={96}
                height={96}
                src={imageThumbnail || imageMain}
                alt="Seller Product Img"
                disableLazyLoad={false}
                disableSkeletonRender={false}
                disableAspectRatio
                isRound
              />
            ))}
      </ProductList>
      <Divider />
    </Box>
  ) : null;
}

const ProductList = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 96px;
  grid-auto-rows: 96px;
  gap: 8px;
  margin: 0 -20px;
  padding: 16px 20px 0;
  overflow-x: auto;
  overflow-y: hidden;
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

export default memo(ProductSellerProductList);
