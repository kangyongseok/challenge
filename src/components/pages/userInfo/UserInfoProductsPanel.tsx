import { Fragment, useCallback, useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Flexbox, Grid, Typography } from '@mrcamelhub/camel-ui';

import { NewProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchProductsByUserId } from '@api/user';

import { productType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

interface UserInfoProductsPanelProps {
  userId: number;
}

function UserInfoProductsPanel({ userId }: UserInfoProductsPanelProps) {
  const router = useRouter();

  const { triggered } = useDetectScrollFloorTrigger();

  const params = useMemo(() => ({ userId, size: 20 }), [userId]);
  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.users.productsByUserId(params),
    async ({ pageParam = 0 }) => fetchProductsByUserId({ ...params, page: pageParam }),
    {
      enabled: !!params.userId,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        if (number > 0) {
          logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
            title: attrProperty.title.SELLER_PRODUCT,
            name: attrProperty.name.SELLER_PRODUCT,
            page: number,
            userId
          });
        }

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const groupedProducts = useMemo(() => {
    const contents = pages.flatMap(({ content }) => content);
    const newGroupedProductsLength =
      Math.floor(contents.length / 2) + (Math.floor(contents.length % 2) > 0 ? 1 : 0);
    const newGroupedProducts = [];

    for (let i = 0; i <= newGroupedProductsLength; i += 1) {
      newGroupedProducts.push(contents.splice(0, 2));
    }

    return newGroupedProducts.filter((product) => product.length);
  }, [pages]);

  const handleClickProduct = useCallback(
    (product: ProductResult, id: number) => () => {
      logEvent(attrKeys.userShop.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.productName.USER_SHOP,
        title: attrProperty.productTitle.PRODUCT,
        sellerType: product.sellerType,
        productSellerId: product.productSeller.id,
        productSellerType: product.productSeller.type,
        productSellerAccount: product.productSeller.account,
        useChat: product.sellerType !== productType.collection
      });
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
        source: attrProperty.productSource.USER_SHOP_PRODUCT
      });
      router.push(`/products/${id}`);
    },
    [router]
  );

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  // eslint-disable-next-line no-nested-ternary
  return !isLoading && groupedProducts.length === 0 ? (
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
  ) : isLoading ? (
    <Grid component="section" container rowGap={32}>
      {Array.from(new Array(10), (_, index) => (
        <Grid key={`product-grid-card-skeleton-${index}`} item xs={2}>
          <ProductGridCardSkeleton />
        </Grid>
      ))}
    </Grid>
  ) : (
    <Grid component="section" container rowGap={32}>
      {groupedProducts.map((groupedProduct) => (
        <Fragment key={`grouped-product-${groupedProduct[0]?.id}-${groupedProduct[1]?.id}`}>
          {groupedProduct[0] && (
            <Grid item xs={2}>
              <NewProductGridCard
                product={groupedProduct[0]}
                onClick={handleClickProduct(groupedProduct[0], groupedProduct[0].id)}
                attributes={{
                  name: attrProperty.name.SELLER_INFO,
                  title: attrProperty.title.SELLER_PRODUCT,
                  source: attrProperty.source.MAIN_PERSONAL
                }}
              />
            </Grid>
          )}
          {groupedProduct[1] && (
            <Grid item xs={2}>
              <NewProductGridCard
                product={groupedProduct[1]}
                onClick={handleClickProduct(groupedProduct[1], groupedProduct[1].id)}
                attributes={{
                  name: attrProperty.name.SELLER_INFO,
                  title: attrProperty.title.SELLER_PRODUCT,
                  source: attrProperty.source.MAIN_PERSONAL
                }}
              />
            </Grid>
          )}
        </Fragment>
      ))}
    </Grid>
  );
}

export default UserInfoProductsPanel;
