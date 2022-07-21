import { useEffect, useRef } from 'react';

import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/router';
import { Alert, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import ProductListCard from '@components/UI/molecules/ProductListCard';

import { logEvent } from '@library/amplitude';

import { fetchSellerProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

function SellerProductsPanel() {
  const {
    query: { id: productId }
  } = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const productsPage = useRef(0);

  const sellerProductsParams = {
    productId: Number(productId),
    size: 20
  };

  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    queryKeys.products.sellerProducts(sellerProductsParams),
    async ({ pageParam = 0 }) => fetchSellerProducts({ ...sellerProductsParams, page: pageParam }),
    {
      enabled: !!sellerProductsParams.productId,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  useEffect(() => {
    if (inView) {
      const requestProductsPage = productsPage.current + 1;
      logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
        title: 'SELLER_PRODUCT',
        name: 'SELLER_PRODUCT',
        page: requestProductsPage,
        productId
      });
      fetchNextPage();
    }
  }, [fetchNextPage, inView, productId]);

  return (
    <Box customStyle={{ margin: '16px 0 20px' }}>
      <Alert
        round="16"
        customStyle={{
          padding: '12px 24px'
        }}
      >
        <Typography variant="body2" color={palette.common.grey['20']}>
          카멜이 다루는 명품 브랜드만 보여드려요 (최근 6개월)
        </Typography>
      </Alert>
      <Box
        customStyle={{
          marginTop: 32,
          marginBottom: 16
        }}
      >
        <Typography variant="h4" weight="bold">
          같은 판매자의 매물 보기
        </Typography>
      </Box>
      <Flexbox direction="vertical" gap={20}>
        {data?.pages?.map((sellerProducts) =>
          sellerProducts?.content?.map((product) => (
            <Box key={`sellerInfo-seller-product-${product.id}`}>
              <ProductListCard
                product={product}
                hideMetaSocialInfo
                productAtt={{
                  name: attrKeys.products.SELLER_PRODUCT,
                  ...product
                }}
              />
            </Box>
          ))
        )}
      </Flexbox>
      {!isFetchingNextPage && hasNextPage && (
        <Box
          ref={ref}
          customStyle={{
            height: 20
          }}
        />
      )}
    </Box>
  );
}

export default SellerProductsPanel;
