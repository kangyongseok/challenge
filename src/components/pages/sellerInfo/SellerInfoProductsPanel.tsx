import { useEffect, useMemo } from 'react';

import { Flexbox, Typography } from 'mrcamel-ui';
import { useInfiniteQuery } from '@tanstack/react-query';

import { NewProductListCard, NewProductListCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchSellerProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

interface SellerInfoProductsPanelProps {
  sellerId: number;
}

function SellerInfoProductsPanel({ sellerId }: SellerInfoProductsPanelProps) {
  const { triggered } = useDetectScrollFloorTrigger();

  const params = useMemo(() => ({ sellerId, size: 20 }), [sellerId]);
  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.products.sellerProducts(params),
    async ({ pageParam = 0 }) => fetchSellerProducts({ ...params, page: pageParam }),
    {
      enabled: !!params.sellerId,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        if (number > 0) {
          logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
            title: attrProperty.title.SELLER_PRODUCT,
            name: attrProperty.name.SELLER_PRODUCT,
            page: number,
            sellerId
          });
        }

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const sellerProducts = useMemo(() => pages.flatMap(({ content }) => content), [pages]);

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  return !isLoading && sellerProducts.length === 0 ? (
    <Flexbox
      direction="vertical"
      alignment="center"
      gap={20}
      customStyle={{
        margin: '84px 20px 0'
      }}
    >
      <Typography customStyle={{ width: 52, height: 52, fontSize: 52 }}>🥲</Typography>
      <Typography variant="h3" weight="bold">
        판매중인 매물이 없어요
      </Typography>
    </Flexbox>
  ) : (
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{
        padding: 20
      }}
    >
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <NewProductListCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`profile-user-product-skeleton-${index}`}
              hideMetaInfo
            />
          ))
        : sellerProducts.map((product, index) => (
            <NewProductListCard
              key={`profile-user-product-${product.id}`}
              product={product}
              hideMetaInfo
              attributes={{
                name: attrProperty.name.SELLER_INFO,
                title: attrProperty.title.SELLER_PRODUCT,
                index: index + 1,
                source: attrProperty.source.SELLER_INFO_SELLER_PRODUCT
              }}
            />
          ))}
    </Flexbox>
  );
}

export default SellerInfoProductsPanel;
